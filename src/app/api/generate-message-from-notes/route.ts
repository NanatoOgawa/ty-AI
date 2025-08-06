import { NextRequest, NextResponse } from 'next/server';
import type { GenerateMessageFromNotesRequest, GenerateMessageResponse } from '../../../types';
import { MESSAGE_TYPE_LABELS, TONE_LABELS } from '../../../types';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateMessageFromNotesRequest & { notes: string } = await request.json();
    const { customerName, messageType, tone, notes } = body;

    if (!customerName || !notes) {
      return NextResponse.json(
        { error: 'お客様名とメモは必須です' },
        { status: 400 }
      );
    }

    const prompt = `
あなたは夜職（ホステス、キャバクラ、スナック、バー等）で働く女性です。お客様との親しみやすく温かい関係を大切にしています。

以下のお客様のメモ情報を基に、${MESSAGE_TYPE_LABELS[messageType]}を${TONE_LABELS[tone]}なトーンで作成してください。

【お客様情報】
- お客様名: ${customerName}

【保存されたメモ】
${notes}

【夜職向けの表現ルール】
- 「〜さん」「〜ちゃん」などの親しみやすい呼び方を使用
- 絵文字を適度に使用（😊、💕、✨、🌟）
- 「本当にありがとうございました！」「とても嬉しかったです」などの温かい表現
- 「お疲れ様でした」「お気をつけてお帰りくださいね」などの配慮表現
- 「また遊びに来てくださいね」「いつでもお待ちしています」などの親密感
- 200-300文字程度で読みやすい文章
- 段落分けを意識して見やすく
- 過度にフォーマルな表現は避ける（「敬具」「拝啓」などは使用しない）
- メモの内容を活かした個別化されたメッセージ
- お客様の好みや過去のやり取りを考慮

【メモ内容の自然な変換ルール】
- 保存されたメモの内容を、自然で親しみやすい文章に変換してください
- メモの内容をそのまま引用するのではなく、夜職の女性が実際に話すような自然な表現にしてください
- 例：
  - メモ：「お酒が好き」→ 変換：「お酒を楽しんでいただける」
  - メモ：「家族の話をよくする」→ 変換：「ご家族の話をよく聞かせていただく」
  - メモ：「誕生日が近い」→ 変換：「もうすぐお誕生日ですね」
- メモの要点は保持しつつ、親しみやすく温かい表現に変換してください
- 複数のメモがある場合は、それらを自然に組み合わせて一つの流れのある文章にしてください

【要求】
- ${MESSAGE_TYPE_LABELS[messageType]}を作成
- トーン: ${TONE_LABELS[tone]}
- 日本語で作成
- 夜職特有の親しみやすさと温かみを重視
- お客様への配慮と感謝の気持ちを表現
- メモの内容を活かした個別化されたメッセージ
- お客様の好みや過去のやり取りを考慮
- メモ内容を自然な表現に変換してからメッセージに組み込む

【出力形式】
メッセージのみを出力してください。説明文は不要です。
絵文字は適度に使用し、過度にならないようにしてください。
メモの内容をそのまま引用せず、自然な表現に変換してから使用してください。
`;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini APIキーが設定されていません' },
        { status: 500 }
      );
    }

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
                text: `あなたは夜職で働く親切で温かい女性です。お客様との関係を大切にし、親しみやすく丁寧なメッセージを作成する専門家です。お客様の個別情報を活かしたパーソナライズされたメッセージを作成してください。

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