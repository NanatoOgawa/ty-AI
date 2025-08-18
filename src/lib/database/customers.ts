import { supabase } from "../supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Customer } from "../../types";

export interface CustomerOperations {
  getOrCreateCustomer: (user: User, name: string) => Promise<Customer>;
  getAllCustomers: (user: User) => Promise<Customer[]>;
  updateCustomer: (user: User, customerId: string, updates: Partial<Customer>) => Promise<Customer>;
  deleteCustomer: (user: User, customerId: string) => Promise<void>;
  getCustomerById: (user: User, customerId: string) => Promise<Customer | null>;
}

export const customerOperations: CustomerOperations = {
  async getOrCreateCustomer(user: User, name: string): Promise<Customer> {
    if (!name?.trim()) {
      throw new Error('Customer name is required');
    }

    try {
      // 既存の顧客を検索
      const { data: existingCustomer, error: searchError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .eq('name', name.trim())
        .single();

      if (searchError && searchError.code !== 'PGRST116') {
        console.error('Error searching for customer:', searchError);
        throw new Error('Failed to search for customer');
      }

      if (existingCustomer) {
        console.log('Found existing customer:', existingCustomer.name);
        return existingCustomer;
      }

      // 新しい顧客を作成
      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert([
          {
            user_id: user.id,
            name: name.trim(),
            company: '',
            email: '',
            phone: '',
            preferences: '',
            important_notes: '',
            birthday: null,
            anniversary: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating customer:', insertError);
        throw new Error('Failed to create customer');
      }

      console.log('Created new customer:', newCustomer.name);
      return newCustomer;
    } catch (error) {
      console.error('Error in getOrCreateCustomer:', error);
      throw error;
    }
  },

  async getAllCustomers(user: User): Promise<Customer[]> {
    try {
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        throw new Error('Failed to fetch customers');
      }

      return customers || [];
    } catch (error) {
      console.error('Error in getAllCustomers:', error);
      throw error;
    }
  },

  async updateCustomer(user: User, customerId: string, updates: Partial<Customer>): Promise<Customer> {
    try {
      const { data: updatedCustomer, error } = await supabase
        .from('customers')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer:', error);
        throw new Error('Failed to update customer');
      }

      console.log('Updated customer:', updatedCustomer.name);
      return updatedCustomer;
    } catch (error) {
      console.error('Error in updateCustomer:', error);
      throw error;
    }
  },

  async deleteCustomer(user: User, customerId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting customer:', error);
        throw new Error('Failed to delete customer');
      }

      console.log('Deleted customer:', customerId);
    } catch (error) {
      console.error('Error in deleteCustomer:', error);
      throw error;
    }
  },

  async getCustomerById(user: User, customerId: string): Promise<Customer | null> {
    try {
      const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Customer not found
        }
        console.error('Error fetching customer by ID:', error);
        throw new Error('Failed to fetch customer');
      }

      return customer;
    } catch (error) {
      console.error('Error in getCustomerById:', error);
      throw error;
    }
  }
};
