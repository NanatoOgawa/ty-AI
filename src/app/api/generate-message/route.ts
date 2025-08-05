import { NextRequest, NextResponse } from 'next/server';

interface GenerateMessageRequest {
  customerName: string;
  whatHappened: string;
  messageType: string;
  tone: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateMessageRequest = await request.json();
    const { customerName, whatHappened, messageType, tone } = body;

    // バリデーション
    if (!customerName || !whatHappened) {
      return NextResponse.json(
        { error: 'お客様名と何があったかは必須です' },
        { status: 400 }
      );
    }

    // メッセージタイプの日本語変換
    const messageTypeMap: { [key: string]: string } = {
      'thank_you': 'お礼メッセージ',
      'follow_up': 'フォローアップ',
      'appreciation': '感謝のメッセージ',
      'celebration': 'お祝いメッセージ'
    };

    // トーンの日本語変換
    const toneMap: { [key: string]: string } = {
      'professional': 'ビジネスライク',
      'friendly': '親しみやすい',
      'formal': 'フォーマル',
      'casual': 'カジュアル'
    };

    // プロンプトの作成
    const prompt = `
以下の情報を基に、${messageTypeMap[messageType]}を${toneMap[tone]}なトーンで作成してください。

【お客様情報】
- お客様名: ${customerName}

【何があったか】
${whatHappened}

【要求】
- ${messageTypeMap[messageType]}を作成
- トーン: ${toneMap[tone]}
- 日本語で作成
- 自然で親しみやすい文章
- 具体的で誠実な内容
- 200-300文字程度

【出力形式】
メッセージのみを出力してください。説明文は不要です。
`;

    // Gemini APIの呼び出し（環境変数がない場合はモックレスポンス）
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    console.log('Gemini API Key check:', {
      hasKey: !!geminiApiKey,
      keyLength: geminiApiKey?.length,
      keyPrefix: geminiApiKey?.substring(0, 10) + '...'
    });
    
    if (!geminiApiKey) {
      // モックレスポンス（開発用）
      const mockMessages = {
        'thank_you': {
          'professional': `${customerName}様

この度は${whatHappened.split('•')[1]?.trim() || 'ご協力をいただき'}、誠にありがとうございました。

お客様のご厚意に深く感謝申し上げます。今後ともよろしくお願いいたします。

敬具`,
          'friendly': `${customerName}さん

${whatHappened.split('•')[1]?.trim() || 'ご協力をいただき'}、本当にありがとうございました！

お客様の温かいお気持ちがとても嬉しかったです。これからもよろしくお願いします。

ありがとうございました！`,
          'formal': `${customerName}様

この度は${whatHappened.split('•')[1]?.trim() || 'ご協力をいただき'}、心より感謝申し上げます。

お客様のご厚情に深く感謝いたします。今後ともご指導ご鞭撻を賜りますよう、よろしくお願い申し上げます。

敬具`,
          'casual': `${customerName}さん

${whatHappened.split('•')[1]?.trim() || 'ご協力をいただき'}、ありがとうございました！

本当に助かりました。これからもよろしくお願いします。

ありがとう！`
        }
      };

      const message = mockMessages.thank_you[tone as keyof typeof mockMessages.thank_you] || 
                     mockMessages.thank_you.professional;

      return NextResponse.json({ 
        message,
        note: '※ これはモックメッセージです。実際のGemini APIキーを設定すると、より適切なメッセージが生成されます。'
      });
    }

    // 実際のGemini API呼び出し
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `あなたは親切で丁寧なビジネスメッセージを作成する専門家です。以下の指示に従ってメッセージを作成してください。

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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedMessage = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!generatedMessage) {
      throw new Error('メッセージの生成に失敗しました');
    }

    return NextResponse.json({ message: generatedMessage });

  } catch (error) {
    console.error('Message generation error:', error);
    return NextResponse.json(
      { error: 'メッセージの生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 