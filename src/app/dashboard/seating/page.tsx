import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import SeatingClient from './SeatingClient';

export default async function SeatingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [ { data: guests }, { data: tables } ] = await Promise.all([
    supabase.from('guests').select('*').eq('couple_id', user.id).eq('rsvp_status', 'ATTENDING').order('full_name', { ascending: true }),
    supabase.from('wedding_tables').select('*').eq('couple_id', user.id).order('created_at', { ascending: true })
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-heading text-foreground tracking-tight">Masa Planlama</h1>
        <p className="text-muted-foreground mt-2 text-lg">Kesinleşen misafirlerinizi oluşturduğunuz masalara yerleştirin.</p>
      </div>

      <SeatingClient initialGuests={guests || []} initialTables={tables || []} />
    </div>
  );
}
