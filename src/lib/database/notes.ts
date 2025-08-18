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
  deleteCustomerNote: (user: User, noteId: string) => Promise<void>;
}

export const noteOperations: NoteOperations = {
  async saveCustomerNote(user: User, customerName: string, note: string): Promise<CustomerNote> {
    if (!customerName?.trim() || !note?.trim()) {
      throw new Error('Customer name and note are required');
    }

    try {
      // まずお客様を取得または作成
      const { customerOperations } = await import('./customers');
      const customer = await customerOperations.getOrCreateCustomer(user, customerName);

      const { data: savedNote, error } = await supabase
        .from('customer_notes')
        .insert([
          {
            user_id: user.id,
            customer_id: customer.id,
            note_content: note.trim(),
            note_type: 'general',
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
      
      // 返り値の構造をCustomerNote型に合わせて変換
      return {
        id: savedNote.id,
        user_id: savedNote.user_id,
        customer_name: customerName.trim(),
        note: savedNote.note_content,
        created_at: savedNote.created_at,
        updated_at: savedNote.updated_at
      };
    } catch (error) {
      console.error('Error in saveCustomerNote:', error);
      throw error;
    }
  },

  async getCustomerNotes(user: User, customerName?: string): Promise<CustomerNote[]> {
    try {
      let query = supabase
        .from('customer_notes')
        .select('*, customers!customer_notes_customer_id_fkey(name)')
        .eq('user_id', user.id);

      if (customerName?.trim()) {
        // customer_nameで検索する場合は、customersテーブルと結合して検索
        query = query.eq('customers.name', customerName.trim());
      }

      const { data: notes, error } = await query
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customer notes:', error);
        throw new Error('Failed to fetch customer notes');
      }

      // 返り値の構造をCustomerNote型に合わせて変換
      return (notes || []).map(note => ({
        id: note.id,
        user_id: note.user_id,
        customer_name: note.customers?.name || '',
        note: note.note_content,
        created_at: note.created_at,
        updated_at: note.updated_at
      }));
    } catch (error) {
      console.error('Error in getCustomerNotes:', error);
      throw error;
    }
  },

  async getNoteById(user: User, noteId: string): Promise<CustomerNote | null> {
    try {
      const { data: note, error } = await supabase
        .from('customer_notes')
        .select('*, customers!customer_notes_customer_id_fkey(name)')
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

      // 返り値の構造をCustomerNote型に合わせて変換
      return {
        id: note.id,
        user_id: note.user_id,
        customer_name: note.customers?.name || '',
        note: note.note_content,
        created_at: note.created_at,
        updated_at: note.updated_at
      };
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
          note_content: note.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
        .eq('user_id', user.id)
        .select('*, customers!customer_notes_customer_id_fkey(name)')
        .single();

      if (error) {
        console.error('Error updating note:', error);
        throw new Error('Failed to update note');
      }

      console.log('Updated note:', noteId);
      
      // 返り値の構造をCustomerNote型に合わせて変換
      return {
        id: updatedNote.id,
        user_id: updatedNote.user_id,
        customer_name: updatedNote.customers?.name || '',
        note: updatedNote.note_content,
        created_at: updatedNote.created_at,
        updated_at: updatedNote.updated_at
      };
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
        .select('*, customers!customer_notes_customer_id_fkey(name)')
        .eq('user_id', user.id)
        .in('id', noteIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching selected notes:', error);
        throw new Error('Failed to fetch selected notes');
      }

      // 返り値の構造をCustomerNote型に合わせて変換
      return (notes || []).map(note => ({
        id: note.id,
        user_id: note.user_id,
        customer_name: note.customers?.name || '',
        note: note.note_content,
        created_at: note.created_at,
        updated_at: note.updated_at
      }));
    } catch (error) {
      console.error('Error in getSelectedNotes:', error);
      throw error;
    }
  },

  async deleteCustomerNote(user: User, noteId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('customer_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting customer note:', error);
        throw new Error('Failed to delete customer note');
      }

      console.log('Deleted customer note:', noteId);
    } catch (error) {
      console.error('Error in deleteCustomerNote:', error);
      throw error;
    }
  }
};
