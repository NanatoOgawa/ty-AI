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
以下のお客様のメモ情報を基に、${MESSAGE_TYPE_LABELS[messageType]}を${TONE_LABELS[tone]}なトーンで作成してください。

【お客様情報】
- お客様名: ${customerName}

【保存されたメモ】
${notes}

【要求】
- ${MESSAGE_TYPE_LABELS[messageType]}を作成
- トーン: ${TONE_LABELS[tone]}
- 日本語で作成
- 自然で親しみやすい文章
- 200-300文字程度
- メモの内容を活かした個別化されたメッセージ
- お客様の好みや過去のやり取りを考慮

【出力形式】
メッセージのみを出力してください。説明文は不要です。
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
                text: `あなたは親切で丁寧なビジネスメッセージを作成する専門家です。お客様の個別情報を活かしたパーソナライズされたメッセージを作成してください。

${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      console.error('Gemini API error:', errorData);
      
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