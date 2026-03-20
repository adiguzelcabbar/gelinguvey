import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch guests representing the couple
  const { data: guests } = await supabase
    .from('guests')
    .select('*')
    .eq('couple_id', user.id)
    .order('created_at', { ascending: false });

  async function addGuest(formData: FormData) {
    'use server'
    const supabaseClient = await createClient()
    const { data: { user: currentUser } } = await supabaseClient.auth.getUser()

    if (!currentUser) return

    const full_name = formData.get('full_name') as string
    const phone_number = formData.get('phone_number') as string || ''
    const email = formData.get('email') as string
    const plus_one_allowed = formData.get('plus_one_allowed') === 'on'

    await supabaseClient.from('guests').insert({
       couple_id: currentUser.id,
       full_name,
       phone_number,
       email,
       plus_one_allowed,
       rsvp_status: 'PENDING',
       dietary_preference: 'STANDARD'
    })

    revalidatePath('/dashboard')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ATTENDING': return <Badge className="bg-primary hover:bg-primary/90 text-white">Katılıyor</Badge>
      case 'DECLINED': return <Badge variant="destructive">Katılamıyor</Badge>
      default: return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200 font-medium tracking-wide">Bekliyor</Badge>
    }
  }

  const getMagicLink = (guestId: string) => {
    return `/r/${guestId}`;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-heading text-foreground tracking-tight">Misafir Yönetimi</h1>
        <p className="text-muted-foreground mt-2 text-lg">Düğün davetlilerinizi ekleyin ve LCV (RSVP) durumlarını anlık takip edin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Ekleme Formu */}
        <Card className="lg:col-span-1 shadow-sm border-0 bg-white ring-1 ring-black/5 h-fit sticky top-24">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-heading text-foreground">Yeni Davetli</CardTitle>
          <CardDescription>Düğün davetlilerinizi ekleyin ve dönüşünü izleyin.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={addGuest} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium">Ad Soyad</Label>
                <Input id="full_name" name="full_name" placeholder="Örn: Ahmet Yılmaz" required className="bg-background/50 focus:bg-background transition-colors" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">E-posta Adresi <span className="text-destructive">*</span></Label>
                <Input id="email" name="email" type="email" required placeholder="misafir@ornek.com" className="bg-background/50 focus:bg-background transition-colors" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-sm font-medium">Telefon Numarası <span className="text-muted-foreground font-normal">(İsteğe bağlı)</span></Label>
                <Input id="phone_number" name="phone_number" placeholder="0555 555 55 55" className="bg-background/50 focus:bg-background transition-colors" />
              </div>
              <div className="flex items-center space-x-3 pt-2 bg-primary/5 p-3 rounded-lg border border-primary/10">
                <input type="checkbox" id="plus_one_allowed" name="plus_one_allowed" className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary/50 cursor-pointer" />
                <Label htmlFor="plus_one_allowed" className="text-sm font-medium cursor-pointer">+1 Eşlikçi (Sevgilisi/Eşiyle gelebilir)</Label>
              </div>
              <Button type="submit" className="w-full mt-2 h-12 text-md shadow-sm">Listeye Ekle</Button>
            </form>
          </CardContent>
        </Card>

        {/* Tablo */}
        <Card className="lg:col-span-2 shadow-sm border-0 bg-white ring-1 ring-black/5">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-2xl font-heading">Davetli Listesi</CardTitle>
              <CardDescription>Toplam {guests?.length || 0} misafir davet ettiniz.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border bg-card/50 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50 text-muted-foreground">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Ad Soyad</TableHead>
                    <TableHead>Telefon & Email</TableHead>
                  <TableHead className="text-center">Durum</TableHead>
                  <TableHead className="text-center">Menü</TableHead>
                  <TableHead>Eşlikçi</TableHead>
                  <TableHead className="text-right">Gönderilen Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guests && guests.length > 0 ? guests.map((guest) => (
                    <TableRow key={guest.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-foreground py-4">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase tracking-wide">
                             {guest.full_name.charAt(0)}
                           </div>
                           <span>{guest.full_name}</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="text-sm text-foreground">{guest.phone_number}</div>
                        {guest.email && <div className="text-xs text-muted-foreground/70 mt-0.5">{guest.email}</div>}
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(guest.rsvp_status)}</TableCell>
                      <TableCell className="text-center">
                        {guest.rsvp_status === 'ATTENDING' && guest.dietary_preference ? (
                          <span className="text-sm font-medium">{
                            guest.dietary_preference === 'VEGAN' ? 'Vegan' : 
                            guest.dietary_preference === 'VEGETARIAN' ? 'Vejetaryen' : 
                            guest.dietary_preference === 'CHILD' ? 'Çocuk' : 'Standart'
                          }</span>
                        ) : <span className="text-sm text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        {guest.plus_one_allowed ? (
                          <div className="flex flex-col items-center justify-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                                İzni Var
                            </span>
                            {guest.plus_one_name && (
                              <span className="text-xs text-muted-foreground mt-1">
                                {guest.plus_one_name} 
                                {guest.plus_one_dietary_preference && guest.plus_one_dietary_preference !== 'STANDARD' ? ` (${guest.plus_one_dietary_preference === 'VEGAN' ? 'Vegan' : guest.plus_one_dietary_preference === 'VEGETARIAN' ? 'Vejetaryen' : 'Çocuk'})` : ''}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                            <a 
                              href={`/r/${guest.id}`} 
                              target="_blank" 
                              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input shadow-sm h-8 px-3 hover:bg-primary/5 hover:text-primary"
                            >
                              Görüntüle
                            </a>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <p className="text-lg">Henüz misafir eklemediniz.</p>
                          <p className="text-sm mt-1">İlk misafirinizi soldaki formdan ekleyebilirsiniz.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
