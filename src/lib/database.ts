import { createClient } from './supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Customer, MessageHistory, UserStats, CustomerNote, UserTonePreference, MessageRating, ToneAnalysis } from '../types';



// お客様の作成または取得
export async function getOrCreateCustomer(
  user: User,
  customerName: string
): Promise<Customer> {
  const supabase = createClient();
  
  if (!user?.id) {
    throw new Error('ユーザーIDが無効です');
  }

  if (!customerName || customerName.trim() === '') {
    throw new Error('お客様名が無効です');
  }
  
  // 既存のお客様を検索
  const { data: existingCustomer, error: searchError } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .eq('name', customerName.trim())
    .single();

  if (searchError && searchError.code !== 'PGRST116') {
    console.error('Error searching for customer:', searchError);
    throw new Error(`お客様の検索中にエラーが発生しました: ${searchError.message}`);
  }

  if (existingCustomer) {
    console.log('Existing customer found:', existingCustomer.name);
    return existingCustomer;
  }
  
  // 新しいお客様を作成
  const { data: newCustomer, error } = await supabase
    .from('customers')
    .insert({
      user_id: user.id,
      name: customerName.trim()
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    throw new Error(`お客様の作成中にエラーが発生しました: ${error.message}`);
  }

  console.log('New customer created:', newCustomer.name);
  return newCustomer;
}

// メッセージ履歴の保存
export async function saveMessageHistory(
  user: User,
  customerId: string | null,
  customerName: string,
  whatHappened: string,
  messageType: string,
  tone: string,
  generatedMessage: string
): Promise<void> {
  const supabase = createClient();
  
  if (!user?.id) {
    throw new Error('ユーザーIDが無効です');
  }

  if (!customerName || customerName.trim() === '') {
    throw new Error('お客様名が無効です');
  }

  if (!generatedMessage || generatedMessage.trim() === '') {
    throw new Error('生成されたメッセージが無効です');
  }
  
  const { error } = await supabase
    .from('message_history')
    .insert({
      user_id: user.id,
      customer_id: customerId,
      customer_name: customerName.trim(),
      what_happened: whatHappened || '',
      message_type: messageType || 'thank_you',
      tone: tone || 'professional',
      generated_message: generatedMessage.trim()
    });

  if (error) {
    console.error('Error saving message history:', error);
    throw new Error(`メッセージ履歴の保存中にエラーが発生しました: ${error.message}`);
  }

  console.log('Message history saved successfully');
}

// メッセージ履歴の取得
export async function getMessageHistory(user: User): Promise<MessageHistory[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('message_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching message history:', error);
    throw error;
  }

  return data || [];
}



// 統計情報の取得
export async function getStats(user: User): Promise<UserStats> {
  const supabase = createClient();
  
  // 作成済みメッセージ数
  const { count: messageCount } = await supabase
    .from('message_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // 登録お客様数
  const { count: customerCount } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // 今月の使用回数
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: monthlyCount } = await supabase
    .from('message_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString());

  return {
    messageCount: messageCount || 0,
    customerCount: customerCount || 0,
    monthlyCount: monthlyCount || 0
  };
}

// お客さんのメモを保存
export async function saveCustomerNote(
  user: User,
  customerId: string,
  noteContent: string,
  noteType: string = 'general'
): Promise<CustomerNote> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('customer_notes')
    .insert({
      user_id: user.id,
      customer_id: customerId,
      note_content: noteContent,
      note_type: noteType
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving customer note:', error);
    throw error;
  }
  
  return data;
}

// お客さんのメモを取得
export async function getCustomerNotes(
  user: User,
  customerId: string
): Promise<CustomerNote[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('customer_notes')
    .select('*')
    .eq('user_id', user.id)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting customer notes:', error);
    throw error;
  }
  
  return data || [];
}

// お客さんの全メモを取得（文字列として）
export async function getAllCustomerNotes(
  user: User,
  customerName: string
): Promise<string> {
  // お客様を取得
  const customer = await getOrCreateCustomer(user, customerName);
  
  // メモを取得
  const notes = await getCustomerNotes(user, customer.id);
  
  if (notes.length === 0) {
    return '';
  }
  
  // メモをまとめて文字列として返す
  return notes.map(note => 
    `${note.note}`
  ).join('\n');
}

// ユーザーのトーン設定を取得
export async function getUserTonePreferences(user: User): Promise<UserTonePreference[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_tone_preferences')
    .select('*')
    .eq('user_id', user.id)
    .order('tone_type');

  if (error) {
    console.error('Error getting user tone preferences:', error);
    throw error;
  }
  
  return data || [];
}

// ユーザーのトーン設定を保存・更新
export async function saveUserTonePreference(
  user: User,
  toneType: string,
  preferenceScore: number
): Promise<UserTonePreference> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_tone_preferences')
    .upsert({
      user_id: user.id,
      tone_type: toneType,
      preference_score: preferenceScore,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,tone_type'
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving user tone preference:', error);
    throw error;
  }
  
  return data;
}

// メッセージ評価を保存
export async function saveMessageRating(
  user: User,
  messageId: string,
  rating: number,
  toneType: string,
  feedback?: string
): Promise<MessageRating> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('message_ratings')
    .insert({
      user_id: user.id,
      message_id: messageId,
      rating,
      tone_type: toneType,
      feedback
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving message rating:', error);
    throw error;
  }
  
  return data;
}

// ユーザーのトーン分析を取得
export async function getUserToneAnalysis(user: User): Promise<ToneAnalysis[]> {
  const supabase = createClient();
  
  // トーン設定を取得
  const { data: preferences, error: prefError } = await supabase
    .from('user_tone_preferences')
    .select('*')
    .eq('user_id', user.id);

  if (prefError) {
    console.error('Error getting tone preferences:', prefError);
    throw prefError;
  }

  // メッセージ評価を取得
  const { data: ratings, error: ratingError } = await supabase
    .from('message_ratings')
    .select('*')
    .eq('user_id', user.id);

  if (ratingError) {
    console.error('Error getting message ratings:', ratingError);
    throw ratingError;
  }

  // トーン分析を計算
  const toneAnalysis: ToneAnalysis[] = [];
  const allTones = ['professional', 'friendly', 'formal', 'casual'];

  for (const tone of allTones) {
    const preference = preferences?.find(p => p.tone_type === tone);
    const toneRatings = ratings?.filter(r => r.tone_type === tone) || [];
    
    const averageRating = toneRatings.length > 0 
      ? toneRatings.reduce((sum, r) => sum + r.rating, 0) / toneRatings.length 
      : 0;

    const successRate = averageRating / 5; // 5点満点を0-1のスコアに変換
    
    let recommendation = '推奨';
    if (successRate < 0.4) {
      recommendation = '改善が必要';
    } else if (successRate < 0.7) {
      recommendation = '要調整';
    }

    toneAnalysis.push({
      tone_type: tone,
      score: preference?.preference_score || 0.5,
      usage_count: preference?.usage_count || 0,
      success_rate: successRate,
      recommendation
    });
  }

  return toneAnalysis;
}

// トーン使用回数を更新
export async function updateToneUsageCount(user: User, toneType: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('user_tone_preferences')
    .upsert({
      user_id: user.id,
      tone_type: toneType,
      usage_count: 1,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,tone_type'
    })
    .select();

  if (error) {
    console.error('Error updating tone usage count:', error);
    // エラーが発生しても処理を継続
  }
} 