import { supabase } from "../supabase/client";
import type { User } from "@supabase/supabase-js";
import type { MessageHistory, MessageType, Tone, Customer } from "../../types";

export interface MessageOperations {
  saveMessageHistory: (
    user: User,
    customer: Customer,
    customerName: string,
    message: string,
    messageType: MessageType,
    tone: Tone,
    inputContent?: string
  ) => Promise<MessageHistory>;
  getMessageHistory: (user: User) => Promise<MessageHistory[]>;
  getMessageById: (user: User, messageId: string) => Promise<MessageHistory | null>;
  deleteMessage: (user: User, messageId: string) => Promise<void>;
  saveMessageRating: (user: User, messageId: string, rating: number) => Promise<void>;
}

export const messageOperations: MessageOperations = {
  async saveMessageHistory(
    user: User,
    customer: Customer,
    customerName: string,
    message: string,
    messageType: MessageType,
    tone: Tone,
    inputContent?: string
  ): Promise<MessageHistory> {
    if (!customerName?.trim() || !message?.trim()) {
      throw new Error('Customer name and message are required');
    }

    try {
      const { data: savedMessage, error } = await supabase
        .from('message_history')
        .insert([
          {
            user_id: user.id,
            customer_id: customer.id,
            customer_name: customerName.trim(),
            generated_message: message.trim(),
            message_type: messageType,
            tone: tone,
            what_happened: inputContent?.trim() || '',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error saving message history:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Failed to save message history: ${error.message || 'Unknown error'}`);
      }

      console.log('Saved message history for:', customerName);
      return savedMessage;
    } catch (error) {
      console.error('Error in saveMessageHistory:', error);
      throw error;
    }
  },

  async getMessageHistory(user: User): Promise<MessageHistory[]> {
    try {
      const { data: messages, error } = await supabase
        .from('message_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching message history:', error);
        throw new Error('Failed to fetch message history');
      }

      return messages || [];
    } catch (error) {
      console.error('Error in getMessageHistory:', error);
      throw error;
    }
  },

  async getMessageById(user: User, messageId: string): Promise<MessageHistory | null> {
    try {
      const { data: message, error } = await supabase
        .from('message_history')
        .select('*')
        .eq('id', messageId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Message not found
        }
        console.error('Error fetching message by ID:', error);
        throw new Error('Failed to fetch message');
      }

      return message;
    } catch (error) {
      console.error('Error in getMessageById:', error);
      throw error;
    }
  },

  async deleteMessage(user: User, messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('message_history')
        .delete()
        .eq('id', messageId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting message:', error);
        throw new Error('Failed to delete message');
      }

      console.log('Deleted message:', messageId);
    } catch (error) {
      console.error('Error in deleteMessage:', error);
      throw error;
    }
  },

  async saveMessageRating(user: User, messageId: string, rating: number): Promise<void> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    try {
      const { error } = await supabase
        .from('message_ratings')
        .upsert([
          {
            user_id: user.id,
            message_id: messageId,
            rating: rating,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error saving message rating:', error);
        throw new Error('Failed to save message rating');
      }

      console.log('Saved message rating:', { messageId, rating });
    } catch (error) {
      console.error('Error in saveMessageRating:', error);
      throw error;
    }
  }
};
