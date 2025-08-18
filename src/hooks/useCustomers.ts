"use client";

import { useState, useEffect, useCallback } from "react";
import { customerOperations } from "../lib/database/customers";
import type { Customer } from "../types";
import type { User } from "@supabase/supabase-js";
import type { CustomerFormData } from "../components/forms/CustomerForm";

export interface UseCustomersReturn {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  createCustomer: (data: CustomerFormData) => Promise<Customer>;
  updateCustomer: (customerId: string, data: Partial<CustomerFormData>) => Promise<Customer>;
  deleteCustomer: (customerId: string) => Promise<void>;
  refreshCustomers: () => Promise<void>;
  getCustomerById: (customerId: string) => Customer | undefined;
}

export function useCustomers(user: User | null): UseCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCustomers = useCallback(async () => {
    if (!user) {
      setCustomers([]);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const fetchedCustomers = await customerOperations.getAllCustomers(user);
      setCustomers(fetchedCustomers);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createCustomer = useCallback(async (data: CustomerFormData): Promise<Customer> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const newCustomer = await customerOperations.getOrCreateCustomer(user, data.name);
      
      // 追加情報がある場合は更新
      if (data.company || data.email || data.phone || data.preferences || 
          data.important_notes || data.birthday || data.anniversary) {
        const updatedCustomer = await customerOperations.updateCustomer(user, newCustomer.id, {
          company: data.company,
          email: data.email,
          phone: data.phone,
          preferences: data.preferences,
          important_notes: data.important_notes,
          birthday: data.birthday || undefined,
          anniversary: data.anniversary || undefined
        });
        
        setCustomers(prev => [updatedCustomer, ...prev.filter(c => c.id !== updatedCustomer.id)]);
        return updatedCustomer;
      }

      setCustomers(prev => [newCustomer, ...prev.filter(c => c.id !== newCustomer.id)]);
      return newCustomer;
    } catch (err) {
      console.error('Error creating customer:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create customer';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [user]);

  const updateCustomer = useCallback(async (
    customerId: string, 
    data: Partial<CustomerFormData>
  ): Promise<Customer> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      const updatedCustomer = await customerOperations.updateCustomer(user, customerId, {
        ...data,
        birthday: data.birthday || undefined,
        anniversary: data.anniversary || undefined
      });
      
      setCustomers(prev => prev.map(c => c.id === customerId ? updatedCustomer : c));
      return updatedCustomer;
    } catch (err) {
      console.error('Error updating customer:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customer';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [user]);

  const deleteCustomer = useCallback(async (customerId: string): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);
      await customerOperations.deleteCustomer(user, customerId);
      setCustomers(prev => prev.filter(c => c.id !== customerId));
    } catch (err) {
      console.error('Error deleting customer:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [user]);

  const getCustomerById = useCallback((customerId: string): Customer | undefined => {
    return customers.find(c => c.id === customerId);
  }, [customers]);

  useEffect(() => {
    refreshCustomers();
  }, [refreshCustomers]);

  return {
    customers,
    isLoading,
    error,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refreshCustomers,
    getCustomerById
  };
}
