import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import RsvpForm from './RsvpForm';

export default async function GuestRsvpPage({
  params,
}: {
  params: Promise<{ guest_id: string }>;
}) {
  const { guest_id } = await params;
  const supabase = await createClient();

  const { data: guest, error } = await supabase
    .from('guests')
    .select('*, couples(*)')
    .eq('id', guest_id)
    .single();

  if (error || !guest) {
    notFound();
  }

  // Handle Supabase relationships varying based on exact schema
  const couple = Array.isArray(guest.couples) ? guest.couples[0] : guest.couples;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-8 relative overflow-hidden">
      {/* Dekoratif Arka Plan Çemberleri */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-accent/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full max-w-lg">
        <RsvpForm guest={guest} couple={couple} />
      </div>
    </div>
  );
}
