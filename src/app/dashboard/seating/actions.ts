'use server'
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addTable(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const name = formData.get('name') as string;
  const shape = formData.get('shape') as string;
  const capacity = parseInt(formData.get('capacity') as string, 10);

  const { error } = await supabase.from('wedding_tables').insert({
    couple_id: user.id,
    name,
    shape,
    capacity
  });

  if (error) {
    console.error("Add table error:", error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/seating');
  return { success: true };
}

export async function assignGuestToTable(guestId: string, tableId: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase.from('guests').update({ table_id: tableId }).eq('id', guestId).eq('couple_id', user.id);

  if (error) {
    console.error("Assign guest error:", error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/seating');
  return { success: true };
}

export async function renameTable(tableId: string, newName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase.from('wedding_tables').update({ name: newName }).eq('id', tableId).eq('couple_id', user.id);

  if (error) {
    console.error("Rename table error:", error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/seating');
  return { success: true };
}
