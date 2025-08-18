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
  // メモからの生成用パラメータ
  notes?: string;
  relationshipLevel?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ExtendedGenerateMessageRequest = await request.json();
    const { customerName, whatHappened, messageType, tone, customerData, notes, relationshipLevel } = body;

    // バリデーション（メモからの生成 vs 通常の生成）
    const isNotesGeneration = !!notes;
    if (!customerName || (!whatHappened && !notes)) {
      return NextResponse.json(
        { error: isNotesGeneration ? 'お客様名とメモは必須です' : 'お客様名と何があったかは必須です' },
        { status: 400 }
      );
    }

    // ユーザーの設定を取得
    let userTonePreferences = null;
    let userProfile = null;
    try {
      const supabase = createClient();
      const authHeader = request.headers.get('authorization');
      
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (user && !authError) {
          const { getUserTonePreferences, getUserProfile } = await import('../../../lib/database');
          userTonePreferences = await getUserTonePreferences(user);
          userProfile = await getUserProfile(user);
        }
      }
    } catch (error) {
      console.error('Error getting user preferences and profile:', error);
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



    // プロフィール情報を活用した個別化プロンプト
    const { generatePersonalizedPrompt } = await import('../../../lib/prompt-generator');
    
    let prompt;
    if (isNotesGeneration) {
      // メモからの生成
      prompt = generatePersonalizedPrompt(
        userProfile,
        MESSAGE_TYPE_LABELS[messageType],
        TONE_LABELS[tone],
        customerName,
        'メモの内容に基づいてメッセージを作成',
        null, // customerData
        '',   // toneAdjustment
        notes, // noteContent for relationship level detection
        relationshipLevel // manual relationship level
      );
      
      // メモ専用の追加制限事項を追加
      prompt = `${prompt}

【メモからの生成時の特別な制限事項】
- メモに記載されていない情報は一切使用しないでください
- お客様の職業、会社名、家族構成、趣味、誕生日などは、メモに明記されていない限り言及しないでください
- メモの内容のみに基づいてメッセージを作成してください
- 推測や想像による情報追加は絶対に行わないでください
- メモに書かれていない詳細な個人情報は含めないでください
- 関係性レベルはメモ内容から自動判定されますが、メモにない関係性の詳細は推測しないでください

`;
    } else {
      // 通常の生成
      // 関係性レベル検出のためのメモ内容を取得
      let noteContent = '';
      if (customerData?.preferences) {
        noteContent += customerData.preferences + ' ';
      }
      if (customerData?.important_notes) {
        noteContent += customerData.important_notes;
      }
      
      prompt = generatePersonalizedPrompt(
        userProfile,
        MESSAGE_TYPE_LABELS[messageType],
        TONE_LABELS[tone],
        customerName,
        whatHappened || '',
        customerData,
        toneAdjustment,
        noteContent
      );
    }

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
                text: isNotesGeneration 
                  ? prompt // メモからの生成は既に完全なプロンプト
                  : `あなたは夜職で働く親切で温かい女性です。お客様との関係を大切にし、親しみやすく丁寧なメッセージを作成する専門家です。以下の指示に従ってメッセージを作成してください。

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