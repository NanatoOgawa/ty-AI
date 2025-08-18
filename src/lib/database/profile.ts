import { supabase } from "../supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "../../types";

export interface ProfileOperations {
  getUserProfile: (user: User) => Promise<UserProfile | null>;
  saveUserProfile: (user: User, profile: Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<UserProfile>;
  updateUserProfile: (user: User, profileId: string, profile: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<UserProfile>;
}

export const profileOperations: ProfileOperations = {
  async getUserProfile(user: User): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Profile not found
        }
        console.error('Error fetching user profile:', error);
        throw new Error('Failed to fetch user profile');
      }

      return profile;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      throw error;
    }
  },

  async saveUserProfile(user: User, profile: Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
    try {
      const { data: savedProfile, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: user.id,
            work_name: profile.work_name.trim(),
            store_type: profile.store_type,
            experience_years: profile.experience_years,
            personality_type: profile.personality_type,
            speaking_style: profile.speaking_style,
            age_range: profile.age_range,
            specialty_topics: profile.specialty_topics.trim(),
            work_schedule: profile.work_schedule,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error saving user profile:', error);
        throw new Error('Failed to save user profile');
      }

      console.log('Saved user profile for user:', user.id);
      return savedProfile;
    } catch (error) {
      console.error('Error in saveUserProfile:', error);
      throw error;
    }
  },

  async updateUserProfile(user: User, profileId: string, profile: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<UserProfile> {
    try {
      const updateData: Record<string, string | number> = {
        updated_at: new Date().toISOString()
      };

      // 更新するフィールドのみを追加
      if (profile.work_name !== undefined) updateData.work_name = profile.work_name.trim();
      if (profile.store_type !== undefined) updateData.store_type = profile.store_type;
      if (profile.experience_years !== undefined) updateData.experience_years = profile.experience_years;
      if (profile.personality_type !== undefined) updateData.personality_type = profile.personality_type;
      if (profile.speaking_style !== undefined) updateData.speaking_style = profile.speaking_style;
      if (profile.age_range !== undefined) updateData.age_range = profile.age_range;
      if (profile.specialty_topics !== undefined) updateData.specialty_topics = profile.specialty_topics.trim();
      if (profile.work_schedule !== undefined) updateData.work_schedule = profile.work_schedule;

      const { data: updatedProfile, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', profileId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        throw new Error('Failed to update user profile');
      }

      console.log('Updated user profile:', profileId);
      return updatedProfile;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      throw error;
    }
  }
};
