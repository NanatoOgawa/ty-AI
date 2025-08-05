import { createClient } from './supabase/client';
import type { User } from '@supabase/supabase-js';

export interface Customer {
  id: string;
  name: string;
  notes?: string;
  created_at: string;
}

export interface MessageHistory {
  id: string;
  customer_id?: string;
  customer_name: string;
  what_happened: string;
  message_type: string;
  tone: string;
  generated_message: string;
  created_at: string;
}

// お客様の取得
export async function getCustomers(user: User): Promise<Customer[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }

  return data || [];
}

// お客様の作成または取得
export async function getOrCreateCustomer(
  user: User,
  customerName: string
): Promise<Customer> {
  const supabase = createClient();
  
  console.log('Searching for existing customer:', customerName, 'for user:', user.id);
  
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
    console.log('Found existing customer:', existingCustomer.id);
    return existingCustomer;
  }

  console.log('Creating new customer:', customerName);
  
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

  console.log('Created new customer:', newCustomer.id);
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
  
  console.log('Saving message history with data:', {
    user_id: user.id,
    customer_id: customerId,
    customer_name: customerName,
    message_type: messageType,
    tone: tone
  });
  
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

// 特定のお客様のメッセージ履歴を取得
export async function getCustomerMessageHistory(
  user: User,
  customerName: string
): Promise<MessageHistory[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('message_history')
    .select('*')
    .eq('user_id', user.id)
    .eq('customer_name', customerName)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customer message history:', error);
    throw error;
  }

  return data || [];
}

// 統計情報の取得
export async function getStats(user: User) {
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