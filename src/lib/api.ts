import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type NusukAccount = Database['public']['Tables']['nusuk_accounts']['Row'];
export type BookingMonitor = Database['public']['Tables']['booking_monitors']['Row'];
export type NusukCompanion = Database['public']['Tables']['nusuk_companions']['Row'];

export const api = {
  // Account Management
  async saveNusukAccount(data: { username: string; password_encrypted: string; user_id?: string }) {
    const { data: existing, error: fetchError } = await supabase
      .from('nusuk_accounts')
      .select('id')
      .eq('username', data.username)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      const { data: updated, error } = await supabase
        .from('nusuk_accounts')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    } else {
      const { data: created, error } = await supabase
        .from('nusuk_accounts')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return created;
    }
  },

  async getNusukAccount(username?: string) {
    let query = supabase.from('nusuk_accounts').select('*');
    if (username) {
      query = query.eq('username', username);
    }
    const { data, error } = await query.order('updated_at', { ascending: false }).limit(1).maybeSingle();
    if (error) throw error;
    return data;
  },

  // Monitor/Config Management
  async saveBookingMonitor(data: {
    account_id: string;
    target_date: string; // Stored as specific date or pattern
    check_interval: number;
    is_active: boolean;
    status: string;
  }) {
    // Check for existing monitor for this account
    const { data: existing, error: fetchError } = await supabase
      .from('booking_monitors')
      .select('id')
      .eq('account_id', data.account_id)
      .maybeSingle();
      
     if (fetchError) throw fetchError;

     if (existing) {
         const { data: updated, error } = await supabase
         .from('booking_monitors')
         .update({ ...data, updated_at: new Date().toISOString() })
         .eq('id', existing.id)
         .select()
         .single();
         if (error) throw error;
         return updated;
     } else {
         const { data: created, error } = await supabase
         .from('booking_monitors')
         .insert([data])
         .select()
         .single();
         if (error) throw error;
         return created;
     }
  },
  
  async getBookingMonitor(accountId: string) {
      const { data, error } = await supabase
          .from('booking_monitors')
          .select('*')
          .eq('account_id', accountId)
          .maybeSingle();
      if (error) throw error;
      return data;
  },

  // Companion Management
  async getCompanions(accountId: string) {
    const { data, error } = await supabase
      .from('nusuk_companions')
      .select('*')
      .eq('account_id', accountId);
    if (error) throw error;
    return data;
  },

  async addCompanion(companion: {
    account_id: string;
    companion_name: string;
    companion_id: string; // National ID
    is_selected: boolean;
  }) {
    const { data, error } = await supabase
      .from('nusuk_companions')
      .insert([companion])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateCompanion(id: string, updates: Partial<NusukCompanion>) {
    const { data, error } = await supabase
      .from('nusuk_companions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCompanion(id: string) {
    const { error } = await supabase
      .from('nusuk_companions')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
