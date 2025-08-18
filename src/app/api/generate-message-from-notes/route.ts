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

    // プロフィール情報を活用した個別化プロンプト（メモ版）
    const { generatePersonalizedPrompt } = await import('../../../lib/prompt-generator');
    
    // ユーザープロフィールを取得
    let userProfile = null;
    try {
      const { createClient } = await import('../../../lib/supabase/client');
      const supabase = createClient();
      
      // リクエストヘッダーから認証情報を取得
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (user && !authError) {
          const { getUserProfile } = await import('../../../lib/database');
          userProfile = await getUserProfile(user);
        }
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
    }
    
    const prompt = generatePersonalizedPrompt(
      userProfile,
      MESSAGE_TYPE_LABELS[messageType],
      TONE_LABELS[tone],
      customerName,
      'メモの内容に基づいてメッセージを作成',
      null, // customerData
      '',   // toneAdjustment
      notes // noteContent for relationship level detection
    );

    // メモ専用の追加制限事項を追加
    const enhancedPrompt = `${prompt}

【メモからの生成時の特別な制限事項】
- メモに記載されていない情報は一切使用しないでください
- お客様の職業、会社名、家族構成、趣味、誕生日などは、メモに明記されていない限り言及しないでください
- メモの内容のみに基づいてメッセージを作成してください
- 推測や想像による情報追加は絶対に行わないでください
- メモに書かれていない詳細な個人情報は含めないでください
- 関係性レベルはメモ内容から自動判定されますが、メモにない関係性の詳細は推測しないでください

`;

    // 実際のプロンプトとして enhancedPrompt を使用
    const finalPrompt = enhancedPrompt;

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
                text: finalPrompt
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