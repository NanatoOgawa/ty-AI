"use client";

import { useState, useEffect, useCallback } from "react";
import { messageOperations } from "../lib/database/messages";
import type { MessageHistory, MessageType, Tone } from "../types";
import type { User } from "@supabase/supabase-js";

export interface UseMessagesReturn {
  messages: MessageHistory[];
  isLoading: boolean;
  error: string | null;
  saveMessage: (
    customerName: string,
    message: string,
    messageType: MessageType,
    tone: Tone,
    inputContent?: string
  ) => Promise<MessageHistory>;
  deleteMessage: (messageId: string) => Promise<void>;
  rateMessage: (messageId: string, rating: number) => Promise<void>;
  refreshMessages: () => Promise<void>;
  getMessageById: (messageId: string) => MessageHistory | undefined;
  getMessagesByCustomer: (customerName: string) => MessageHistory[];
}

export function useMessages(user: User | null): UseMessagesReturn {
  const [messages, setMessages] = useState<MessageHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshMessages = useCallback(async () => {
    if (!user) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const fetchedMessages = await messageOperations.getMessageHistory(user);
      setMessages(fetchedMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const saveMessage = useCallback(async (
    customerName: string,
    message: string,
    messageType: MessageType,
    tone: Tone,
    inputContent?: string
  ): Promise<MessageHistory> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const savedMessage = await messageOperations.saveMessageHistory(
        user,
        customerName,
        message,
        messageType,
        tone,
        inputContent
      );
      
      setMessages(prev => [savedMessage, ...prev]);
      return savedMessage;
    } catch (err) {
      console.error('Error saving message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save message';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [user]);

  const deleteMessage = useCallback(async (messageId: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      await messageOperations.deleteMessage(user, messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err) {
      console.error('Error deleting message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete message';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [user]);

  const rateMessage = useCallback(async (messageId: string, rating: number): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      await messageOperations.saveMessageRating(user, messageId, rating);
      // メッセージ一覧は更新しない（評価は別テーブル）
    } catch (err) {
      console.error('Error rating message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to rate message';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [user]);

  const getMessageById = useCallback((messageId: string): MessageHistory | undefined => {
    return messages.find(m => m.id === messageId);
  }, [messages]);

  const getMessagesByCustomer = useCallback((customerName: string): MessageHistory[] => {
    return messages.filter(m => m.customer_name === customerName);
  }, [messages]);

  useEffect(() => {
    refreshMessages();
  }, [refreshMessages]);

  return {
    messages,
    isLoading,
    error,
    saveMessage,
    deleteMessage,
    rateMessage,
    refreshMessages,
    getMessageById,
    getMessagesByCustomer
  };
}
