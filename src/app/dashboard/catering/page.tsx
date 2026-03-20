import { createClient } from '@/utils/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, ChefHat } from 'lucide-react';
import { redirect } from 'next/navigation';
import MenuSettings from './MenuSettings';

export default async function CateringPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [ { data: guests }, { data: couple } ] = await Promise.all([
    supabase.from('guests').select('*').eq('couple_id', user.id).eq('rsvp_status', 'ATTENDING'),
    supabase.from('couples').select('*').eq('id', user.id).single()
  ]);

  const customMenus: {id: string, name: string, desc: string}[] = couple?.custom_menus || [
    {id: 'standard', name: 'Standart Menü', desc: ''},
    {id: 'vegan', name: 'Vegan Menü', desc: ''},
    {id: 'vegetarian', name: 'Vejetaryen Menü', desc: ''},
    {id: 'child', name: 'Çocuk Menüsü', desc: ''}
  ];

  const menuCounts: Record<string, number> = {};
  customMenus.forEach(m => menuCounts[m.id] = 0);

  let totalPlusOnes = 0;

  guests?.forEach(g => {
    // Map legacy string to dynamic ID if encountered
    let p1 = g.dietary_preference;
    if (p1 === 'STANDARD') p1 = 'standard';
    else if (p1 === 'VEGAN') p1 = 'vegan';
    else if (p1 === 'VEGETARIAN') p1 = 'vegetarian';
    else if (p1 === 'CHILD') p1 = 'child';

    if (p1 && menuCounts[p1] !== undefined) menuCounts[p1]++;
    else if (p1) menuCounts[p1] = (menuCounts[p1] || 0) + 1; // Legacy catch

    if (g.plus_one_allowed && g.plus_one_name && g.plus_one_name.trim() !== '') {
      totalPlusOnes++;
      let p2 = g.plus_one_dietary_preference;
      if (p2 === 'STANDARD') p2 = 'standard';
      else if (p2 === 'VEGAN') p2 = 'vegan';
      else if (p2 === 'VEGETARIAN') p2 = 'vegetarian';
      else if (p2 === 'CHILD') p2 = 'child';

      if (p2 && menuCounts[p2] !== undefined) menuCounts[p2]++;
      else if (p2) menuCounts[p2] = (menuCounts[p2] || 0) + 1;
    }
  });

  const totalAttendingGuests = guests?.length || 0;
  const totalMeals = totalAttendingGuests + totalPlusOnes;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-heading text-foreground tracking-tight">Mutfak Panosu</h1>
        <p className="text-muted-foreground mt-2 text-lg">Catering şirketiyle paylaşabileceğiniz tam ve net menü porsiyon sayıları.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        
        <Card className="shadow-sm border-0 ring-1 ring-primary/20 bg-primary/5 sm:col-span-2 lg:col-span-4 xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">Toplam Sunulacak Porsiyon</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-heading font-bold text-foreground">{totalMeals}</div>
            <p className="text-xs text-muted-foreground mt-1">Eşlikçiler dahil net katılımcı sayısı</p>
          </CardContent>
        </Card>

        {customMenus.map((menu) => {
           const count = menuCounts[menu.id] || 0;
           return (
             <Card key={menu.id} className="shadow-sm border-0 ring-1 ring-black/5 bg-white flex flex-col justify-between hover:ring-primary/20 transition-all">
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-medium text-foreground line-clamp-2">{menu.name}</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-4xl font-heading font-bold text-primary/80">{count}</div>
                 <p className="text-xs text-muted-foreground mt-1">Misafir Seçimi</p>
               </CardContent>
             </Card>
           )
        })}
      </div>

      <Card className="shadow-sm border-0 bg-white ring-1 ring-black/5 mt-8 max-w-3xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-heading flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-foreground" />
            Özel Menü Dağılımı
          </CardTitle>
          <CardDescription>
            Hazırladığınız dinamik menülerin eşlikçiler dahil genel seçim oranları.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="space-y-4">
              {customMenus.map(menu => (
                <div key={menu.id} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary/60" />
                    <span className="font-medium text-foreground">{menu.name}</span>
                  </div>
                  <span className="font-bold text-lg">{menuCounts[menu.id] || 0} porsiyon</span>
                </div>
              ))}
           </div>
        </CardContent>
      </Card>
      
      <MenuSettings couple={couple} />
    </div>
  )
}
