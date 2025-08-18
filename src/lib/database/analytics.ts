import { supabase } from "../supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserStats, ToneAnalysis, UserTonePreference, Tone } from "../../types";

export interface AnalyticsOperations {
  getStats: (user: User) => Promise<UserStats>;
  getUserToneAnalysis: (user: User) => Promise<ToneAnalysis[]>;
  getUserTonePreferences: (user: User) => Promise<UserTonePreference[]>;
  saveUserTonePreference: (user: User, tone: Tone, preference: number) => Promise<void>;
  updateToneUsageCount: (user: User, tone: Tone) => Promise<void>;
  calculateToneSuccessRate: (user: User, tone: Tone) => Promise<number>;
}

export const analyticsOperations: AnalyticsOperations = {
  async getStats(user: User): Promise<UserStats> {
    try {
      // メッセージ総数を取得
      const { data: messages, error: messageError } = await supabase
        .from('message_history')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id);

      if (messageError) {
        console.error('Error fetching message count:', messageError);
      }

      // お客様総数を取得
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id);

      if (customerError) {
        console.error('Error fetching customer count:', customerError);
      }

      // 今月のメッセージ数を取得
      const currentMonth = new Date();
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      const { data: monthlyMessages, error: monthlyError } = await supabase
        .from('message_history')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .gte('created_at', firstDayOfMonth.toISOString());

      if (monthlyError) {
        console.error('Error fetching monthly message count:', monthlyError);
      }

      const stats: UserStats = {
        messageCount: messages?.length || 0,
        customerCount: customers?.length || 0,
        monthlyCount: monthlyMessages?.length || 0
      };

      console.log('Retrieved user stats:', stats);
      return stats;
    } catch (error) {
      console.error('Error in getStats:', error);
      return {
        messageCount: 0,
        customerCount: 0,
        monthlyCount: 0
      };
    }
  },

  async getUserToneAnalysis(user: User): Promise<ToneAnalysis[]> {
    try {
      const { data: toneAnalysis, error } = await supabase
        .from('user_tone_analysis')
        .select('*')
        .eq('user_id', user.id)
        .order('usage_count', { ascending: false });

      if (error) {
        console.error('Error fetching tone analysis:', error);
        return [];
      }

      return toneAnalysis || [];
    } catch (error) {
      console.error('Error in getUserToneAnalysis:', error);
      return [];
    }
  },

  async getUserTonePreferences(user: User): Promise<UserTonePreference[]> {
    try {
      const { data: preferences, error } = await supabase
        .from('user_tone_preferences')
        .select('*')
        .eq('user_id', user.id)
        .order('preference_score', { ascending: false });

      if (error) {
        console.error('Error fetching tone preferences:', error);
        return [];
      }

      return preferences || [];
    } catch (error) {
      console.error('Error in getUserTonePreferences:', error);
      return [];
    }
  },

  async saveUserTonePreference(user: User, tone: Tone, preference: number): Promise<void> {
    if (preference < 1 || preference > 5) {
      throw new Error('Preference score must be between 1 and 5');
    }

    try {
      const { error } = await supabase
        .from('user_tone_preferences')
        .upsert([
          {
            user_id: user.id,
            tone: tone,
            preference_score: preference,
            updated_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error saving tone preference:', error);
        throw new Error('Failed to save tone preference');
      }

      console.log('Saved tone preference:', { tone, preference });
    } catch (error) {
      console.error('Error in saveUserTonePreference:', error);
      throw error;
    }
  },

  async updateToneUsageCount(user: User, tone: Tone): Promise<void> {
    try {
      // 既存のレコードがあるかチェック
      const { data: existing, error: fetchError } = await supabase
        .from('user_tone_analysis')
        .select('*')
        .eq('user_id', user.id)
        .eq('tone', tone)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching tone analysis:', fetchError);
        throw new Error('Failed to fetch tone analysis');
      }

      if (existing) {
        // 既存のレコードを更新
        const { error: updateError } = await supabase
          .from('user_tone_analysis')
          .update({
            usage_count: existing.usage_count + 1,
            last_used_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('tone', tone);

        if (updateError) {
          console.error('Error updating tone usage count:', updateError);
          throw new Error('Failed to update tone usage count');
        }
      } else {
        // 新しいレコードを作成
        const { error: insertError } = await supabase
          .from('user_tone_analysis')
          .insert([
            {
              user_id: user.id,
              tone: tone,
              usage_count: 1,
              success_rate: 0.0,
              last_used_at: new Date().toISOString()
            }
          ]);

        if (insertError) {
          console.error('Error creating tone analysis:', insertError);
          throw new Error('Failed to create tone analysis');
        }
      }

      console.log('Updated tone usage count:', { tone });
    } catch (error) {
      console.error('Error in updateToneUsageCount:', error);
      throw error;
    }
  },

  async calculateToneSuccessRate(user: User, tone: Tone): Promise<number> {
    try {
      // トーンを使用したメッセージの評価を取得
      const { data: ratings, error } = await supabase
        .from('message_ratings')
        .select('rating, message_history!inner(tone)')
        .eq('user_id', user.id)
        .eq('message_history.tone', tone);

      if (error) {
        console.error('Error fetching tone ratings:', error);
        return 0.0;
      }

      if (!ratings || ratings.length === 0) {
        return 0.0;
      }

      // 平均評価を計算（5点満点を100%に換算）
      const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      const successRate = (averageRating / 5.0) * 100;

      console.log('Calculated tone success rate:', { tone, successRate });
      return Math.round(successRate * 100) / 100; // 小数点以下2桁で四捨五入
    } catch (error) {
      console.error('Error in calculateToneSuccessRate:', error);
      return 0.0;
    }
  }
};
