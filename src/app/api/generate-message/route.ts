import { NextRequest, NextResponse } from 'next/server';
import type { GenerateMessageRequest, GenerateMessageResponse } from '../../../types';
import { MESSAGE_TYPE_LABELS, TONE_LABELS } from '../../../types';
import { createClient } from '../../../lib/supabase/client';

interface ExtendedGenerateMessageRequest extends GenerateMessageRequest {
  customerData?: {
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    relationship?: string;
    preferences?: string;
    important_notes?: string;
    birthday?: string;
    anniversary?: string;
  } | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: ExtendedGenerateMessageRequest = await request.json();
    const { customerName, whatHappened, messageType, tone, customerData } = body;

    // バリデーション
    if (!customerName || !whatHappened) {
      return NextResponse.json(
        { error: 'お客様名と何があったかは必須です' },
        { status: 400 }
      );
    }

    // ユーザーのトーン設定を取得
    let userTonePreferences = null;
    try {
      const supabase = createClient();
      const authHeader = request.headers.get('authorization');
      
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (user && !authError) {
          const { getUserTonePreferences } = await import('../../../lib/database');
          userTonePreferences = await getUserTonePreferences(user);
        }
      }
    } catch (error) {
      console.error('Error getting user tone preferences:', error);
      // エラーが発生しても処理を継続
    }

    // トーン設定を考慮したプロンプトを作成
    let toneAdjustment = '';
    if (userTonePreferences && userTonePreferences.length > 0) {
      const currentTonePreference = userTonePreferences.find(p => p.tone_type === tone);
      if (currentTonePreference) {
        const preferenceLevel = currentTonePreference.preference_score;
        if (preferenceLevel > 0.7) {
          toneAdjustment = `\n【トーン調整】\n- このユーザーは${TONE_LABELS[tone]}なトーンを好む傾向があります（設定値: ${Math.round(preferenceLevel * 100)}%）\n- より自然で親しみやすい${TONE_LABELS[tone]}な表現を使用してください`;
        } else if (preferenceLevel < 0.3) {
          toneAdjustment = `\n【トーン調整】\n- このユーザーは${TONE_LABELS[tone]}なトーンをあまり好まない傾向があります（設定値: ${Math.round(preferenceLevel * 100)}%）\n- より控えめで自然な表現を使用してください`;
        }
      }
    }

    // お客様の基本情報を含めたプロンプトを作成
    let customerInfoSection = `- お客様名: ${customerName}`;
    
    if (customerData) {
      customerInfoSection += `\n- 会社名: ${customerData.company || '未登録'}`;
      customerInfoSection += `\n- 関係性: ${customerData.relationship || '未登録'}`;
      
      if (customerData.preferences) {
        customerInfoSection += `\n- 好み・趣味: ${customerData.preferences}`;
      }
      
      if (customerData.important_notes) {
        customerInfoSection += `\n- 重要メモ: ${customerData.important_notes}`;
      }
      
      if (customerData.birthday) {
        customerInfoSection += `\n- 誕生日: ${customerData.birthday}`;
      }
      
      if (customerData.anniversary) {
        customerInfoSection += `\n- 記念日: ${customerData.anniversary}`;
      }
    }

    // 夜職向けの改善されたプロンプト
    const prompt = `
あなたは夜職（ホステス、キャバクラ、スナック、バー等）で働く女性です。お客様との親しみやすく温かい関係を大切にしています。

以下の情報を基に、${MESSAGE_TYPE_LABELS[messageType]}を${TONE_LABELS[tone]}なトーンで作成してください。

【お客様情報】
${customerInfoSection}

【何があったか】
${whatHappened}

【夜職向けの表現ルール】
- 「〜さん」「〜ちゃん」などの親しみやすい呼び方を使用
- 絵文字を適度に使用（😊、💕、✨、🌟）
- 「本当にありがとうございました！」「とても嬉しかったです」などの温かい表現
- 「お疲れ様でした」「お気をつけてお帰りくださいね」などの配慮表現
- 「また遊びに来てくださいね」「いつでもお待ちしています」などの親密感
- 200-300文字程度で読みやすい文章
- 段落分けを意識して見やすく
- 過度にフォーマルな表現は避ける（「敬具」「拝啓」などは使用しない）

【入力内容の自然な変換ルール】
- ユーザーが入力した「何があったか」の内容を、自然で親しみやすい文章に変換してください
- 入力内容をそのまま引用するのではなく、夜職の女性が実際に話すような自然な表現にしてください
- 例：
  - 入力：「商品を購入した」→ 変換：「素敵な商品をお選びいただき」
  - 入力：「長時間お付き合いいただいた」→ 変換：「長い時間お付き合いいただき」
  - 入力：「お酒をたくさん飲んでくれた」→ 変換：「お酒をたくさん楽しんでいただき」
- 入力内容の要点は保持しつつ、親しみやすく温かい表現に変換してください

【お客様情報の活用】
${customerData ? `
- 過去の会話履歴・話題を参考に、より親しみやすい話題を含める
- 重要な会話・特記事項に記載された内容を考慮する
- 誕生日や記念日がある場合は、それらを意識した温かいメッセージにする
- 過去の関係性に応じて適切な敬語レベルを調整する
` : '- お客様の会話履歴が登録されていないため、一般的な親しみやすい表現を使用する'}

【要求】
- ${MESSAGE_TYPE_LABELS[messageType]}を作成
- トーン: ${TONE_LABELS[tone]}
- 日本語で作成
- 夜職特有の親しみやすさと温かみを重視
- お客様への配慮と感謝の気持ちを表現
- 自然で親しみやすい文章${toneAdjustment}
- ユーザー入力内容を自然な表現に変換してからメッセージに組み込む

【出力形式】
メッセージのみを出力してください。説明文は不要です。
絵文字は適度に使用し、過度にならないようにしてください。
入力内容をそのまま引用せず、自然な表現に変換してから使用してください。
`;

    // Gemini APIの呼び出し
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini APIキーが設定されていません' },
        { status: 500 }
      );
    }

    // 実際のGemini API呼び出し
    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `あなたは夜職で働く親切で温かい女性です。お客様との関係を大切にし、親しみやすく丁寧なメッセージを作成する専門家です。以下の指示に従ってメッセージを作成してください。

${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7, // 自然さと創造性のバランスを取る
          maxOutputTokens: 500,
          topP: 0.9, // より自然な文章生成のため
        }
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      
      // 開発環境でのみ詳細ログを出力
      if (process.env.NODE_ENV === 'development') {
        console.error('Gemini API error:', errorData);
      }
      
      // Gemini APIが過負荷の場合は適切なエラーメッセージを返す
      if (apiResponse.status === 503 || errorData.error?.status === 'UNAVAILABLE') {
        return NextResponse.json(
          { error: 'AIサービスが一時的に利用できません。しばらく時間をおいてから再度お試しください。' },
          { status: 503 }
        );
      }
      
      throw new Error(`Gemini API error: ${apiResponse.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await apiResponse.json();
    const generatedMessage = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!generatedMessage) {
      throw new Error('メッセージの生成に失敗しました');
    }

    const response: GenerateMessageResponse = { message: generatedMessage };
    return NextResponse.json(response);

  } catch (error) {
    console.error('Message generation error:', error);
    return NextResponse.json(
      { error: 'メッセージの生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 