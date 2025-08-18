import { supabase } from "../supabase/client";
import type { User } from "@supabase/supabase-js";
import type { CustomerNote } from "../../types";

export interface NoteOperations {
  saveCustomerNote: (user: User, customerName: string, note: string) => Promise<CustomerNote>;
  getCustomerNotes: (user: User, customerName?: string) => Promise<CustomerNote[]>;
  getNoteById: (user: User, noteId: string) => Promise<CustomerNote | null>;
  updateNote: (user: User, noteId: string, note: string) => Promise<CustomerNote>;
  deleteNote: (user: User, noteId: string) => Promise<void>;
  getSelectedNotes: (user: User, noteIds: string[]) => Promise<CustomerNote[]>;
}

export const noteOperations: NoteOperations = {
  async saveCustomerNote(user: User, customerName: string, note: string): Promise<CustomerNote> {
    if (!customerName?.trim() || !note?.trim()) {
      throw new Error('Customer name and note are required');
    }

    try {
      const { data: savedNote, error } = await supabase
        .from('customer_notes')
        .insert([
          {
            user_id: user.id,
            customer_name: customerName.trim(),
            note: note.trim(),
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error saving customer note:', error);
        throw new Error('Failed to save customer note');
      }

      console.log('Saved customer note for:', customerName);
      return savedNote;
    } catch (error) {
      console.error('Error in saveCustomerNote:', error);
      throw error;
    }
  },

  async getCustomerNotes(user: User, customerName?: string): Promise<CustomerNote[]> {
    try {
      let query = supabase
        .from('customer_notes')
        .select('*')
        .eq('user_id', user.id);

      if (customerName?.trim()) {
        query = query.eq('customer_name', customerName.trim());
      }

      const { data: notes, error } = await query
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customer notes:', error);
        throw new Error('Failed to fetch customer notes');
      }

      return notes || [];
    } catch (error) {
      console.error('Error in getCustomerNotes:', error);
      throw error;
    }
  },

  async getNoteById(user: User, noteId: string): Promise<CustomerNote | null> {
    try {
      const { data: note, error } = await supabase
        .from('customer_notes')
        .select('*')
        .eq('id', noteId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Note not found
        }
        console.error('Error fetching note by ID:', error);
        throw new Error('Failed to fetch note');
      }

      return note;
    } catch (error) {
      console.error('Error in getNoteById:', error);
      throw error;
    }
  },

  async updateNote(user: User, noteId: string, note: string): Promise<CustomerNote> {
    if (!note?.trim()) {
      throw new Error('Note content is required');
    }

    try {
      const { data: updatedNote, error } = await supabase
        .from('customer_notes')
        .update({
          note: note.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating note:', error);
        throw new Error('Failed to update note');
      }

      console.log('Updated note:', noteId);
      return updatedNote;
    } catch (error) {
      console.error('Error in updateNote:', error);
      throw error;
    }
  },

  async deleteNote(user: User, noteId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('customer_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting note:', error);
        throw new Error('Failed to delete note');
      }

      console.log('Deleted note:', noteId);
    } catch (error) {
      console.error('Error in deleteNote:', error);
      throw error;
    }
  },

  async getSelectedNotes(user: User, noteIds: string[]): Promise<CustomerNote[]> {
    if (!noteIds || noteIds.length === 0) {
      return [];
    }

    try {
      const { data: notes, error } = await supabase
        .from('customer_notes')
        .select('*')
        .eq('user_id', user.id)
        .in('id', noteIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching selected notes:', error);
        throw new Error('Failed to fetch selected notes');
      }

      return notes || [];
    } catch (error) {
      console.error('Error in getSelectedNotes:', error);
      throw error;
    }
  }
};
