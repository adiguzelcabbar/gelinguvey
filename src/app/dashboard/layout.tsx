import Link from 'next/link';
import { Sparkles, Users, Utensils, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-foreground font-heading text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="hidden sm:inline">Gelin</span><span className="hidden sm:inline text-primary italic font-medium">Güvey</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <Users className="h-4 w-4" /> Misafirler
            </Link>
            <Link href="/dashboard/seating" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h16M4 14h16m-4-8v12M8 6v12"/></svg> Masa Planı
            </Link>
            <Link href="/dashboard/catering" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
              <Utensils className="h-4 w-4" /> Mutfak (Catering)
            </Link>
            <form action={async () => {
              'use server'
              const supabase = await createClient()
              await supabase.auth.signOut()
              redirect('/')
            }}>
              <button className="flex items-center gap-2 text-sm font-medium text-destructive hover:opacity-80 transition-colors">
                <LogOut className="h-4 w-4" /> Çıkış
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
