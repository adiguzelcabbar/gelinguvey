'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateMenuDescriptions(menus: {id: string, name: string, desc: string}[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase.from('couples').update({
    custom_menus: menus
  }).eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/catering');
  revalidatePath('/r/[guest_id]', 'page');
  return { success: true };
}
