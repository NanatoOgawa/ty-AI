import { createClient } from './supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Customer, MessageHistory, UserStats } from '../types';



// お客様の作成または取得
export async function getOrCreateCustomer(
  user: User,
  customerName: string
): Promise<Customer> {
  const supabase = createClient();
  

  
  // 既存のお客様を検索
  const { data: existingCustomer, error: searchError } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .eq('name', customerName)
    .single();

  if (searchError && searchError.code !== 'PGRST116') {
    console.error('Error searching for customer:', searchError);
  }

  if (existingCustomer) {
    return existingCustomer;
  }
  
  // 新しいお客様を作成
  const { data: newCustomer, error } = await supabase
    .from('customers')
    .insert({
      user_id: user.id,
      name: customerName
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    throw error;
  }

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
  

  
  const { error } = await supabase
    .from('message_history')
    .insert({
      user_id: user.id,
      customer_id: customerId,
      customer_name: customerName,
      what_happened: whatHappened,
      message_type: messageType,
      tone: tone,
      generated_message: generatedMessage
    });

  if (error) {
    console.error('Error saving message history:', error);
    throw error;
  }
  

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