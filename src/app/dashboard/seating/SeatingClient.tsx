'use client'

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Users, LayoutGrid, Pencil, Armchair, User } from 'lucide-react';
import { addTable, assignGuestToTable, renameTable } from './actions';
import { cn } from '@/lib/utils';

type Seat = {
  isFilled: boolean;
  guestId?: string;
  name?: string;
  diet?: string;
  isPlusOne?: boolean;
  primaryGuestName?: string;
};

export default function SeatingClient({ initialGuests, initialTables }: { initialGuests: any[], initialTables: any[] }) {
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [loadingGuestId, setLoadingGuestId] = useState<string | null>(null);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);

  const hasPlusOneSeat = (g: any) => {
    if (!g.plus_one_allowed) return false;
    // If pending, reserve the seat. If attending, only reserve if they actually gave a name.
    if (g.rsvp_status === 'PENDING') return true;
    return !!(g.plus_one_name && g.plus_one_name.trim() !== '');
  };

  const getGuestSeats = (g: any) => hasPlusOneSeat(g) ? 2 : 1;

  const handleAssign = async (guestId: string, tableId: string) => {
    setLoadingGuestId(guestId);
    await assignGuestToTable(guestId, tableId === "UNASSIGN" ? null : tableId);
    setLoadingGuestId(null);
  };

  const getTableUsage = (tableId: string) => {
    const assigned = initialGuests.filter(g => g.table_id === tableId);
    const seatsUsed = assigned.reduce((sum, g) => sum + getGuestSeats(g), 0);
    return { assigned, seatsUsed };
  };

  const unassignedGuests = initialGuests.filter(g => !g.table_id);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mt-6">
      {/* Sol Panel: Atanmamış Misafirler */}
      <div className="xl:col-span-1 space-y-4">
        <Card className="border-0 shadow-sm ring-1 ring-black/5 bg-white/50 sticky top-24">
          <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
            <CardTitle className="text-xl font-heading flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Yerleşmemişler
            </CardTitle>
            <CardDescription>{unassignedGuests.length} misafir/grup masaya atanmadı.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 max-h-[60vh] overflow-y-auto">
            {unassignedGuests.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                Harika! Tüm misafirler masalara yerleştirildi 🎉
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {unassignedGuests.map(guest => {
                  const seatsNeeded = getGuestSeats(guest);
                  return (
                    <li key={guest.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-sm text-foreground">{guest.full_name}</p>
                          {hasPlusOneSeat(guest) && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                               + {guest.plus_one_name || "Eşlikçi (Bekleniyor...)"}
                            </p>
                          )}
                          <p className="text-[11px] text-primary/80 mt-1.5 font-medium bg-primary/10 px-2 py-0.5 rounded w-fit">
                            {seatsNeeded} Kişilik Yer Gerekiyor
                          </p>
                        </div>
                      </div>
                      <Select disabled={loadingGuestId === guest.id} onValueChange={(val) => handleAssign(guest.id as string, val as string)}>
                        <SelectTrigger className="h-8 text-xs bg-white mt-2 ring-1 ring-black/5">
                          <SelectValue placeholder="Masa Seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UNASSIGN" className="text-muted-foreground italic">Seçimi Kaldır</SelectItem>
                          {initialTables.map(t => {
                            const { seatsUsed } = getTableUsage(t.id);
                            const remaining = t.capacity - seatsUsed;
                            const isFull = remaining < seatsNeeded;
                            return (
                              <SelectItem key={t.id} value={t.id} disabled={isFull} className={isFull ? 'text-muted-foreground' : ''}>
                                {t.name} (Kalan: {remaining})
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sağ Panel: Masalar */}
      <div className="xl:col-span-3 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5 gap-4">
          <h2 className="text-2xl font-heading text-foreground flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-primary" /> Salon Yerleşkesi ({initialTables.length} Masa)
          </h2>
          <Button onClick={() => setIsAddingTable(!isAddingTable)} variant={isAddingTable ? "secondary" : "default"} className="rounded-full shadow-sm w-full sm:w-auto">
             {isAddingTable ? "İptal Et" : <><PlusCircle className="mr-2 h-4 w-4" /> Yeni Masa Ekle</>}
          </Button>
        </div>

        {isAddingTable && (
          <Card className="border-0 shadow-sm ring-1 ring-primary/20 bg-primary/5 animate-in slide-in-from-top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-heading">Yeni Masa Oluştur</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={async (fd) => { 
                const result = await addTable(fd); 
                if (result?.error) {
                  alert("Masa eklenirken bir hata oluştu: " + result.error);
                } else {
                  setIsAddingTable(false); 
                }
              }} className="flex flex-col sm:flex-row items-end gap-4">
                <div className="space-y-2 w-full">
                  <Label>Masa Adı</Label>
                  <Input name="name" placeholder="Örn: Gelin Ailesi" required className="bg-white" />
                </div>
                <div className="space-y-2 w-full">
                  <Label>Şekil</Label>
                  <Select name="shape" defaultValue="CIRCLE">
                    <SelectTrigger className="bg-white h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CIRCLE">Yuvarlak</SelectItem>
                      <SelectItem value="RECTANGLE">Dikdörtgen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 w-full">
                  <Label>Kapasite (Kişi)</Label>
                  <Input name="capacity" type="number" min="1" max="50" defaultValue="10" required className="bg-white" />
                </div>
                <Button type="submit" className="w-full sm:w-auto px-8 h-10">Oluştur</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {initialTables.length === 0 && !isAddingTable && (
           <div className="p-12 text-center text-muted-foreground bg-white/50 rounded-xl ring-1 ring-black/5 border-dashed border-2">
             Hiç masa oluşturmadınız. Yukarıdaki butona tıklayarak masalarınızı eklemeye başlayın.
           </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {initialTables.map(table => {
            const { assigned, seatsUsed } = getTableUsage(table.id);
            const isFull = seatsUsed >= table.capacity;
            const isWarning = seatsUsed > table.capacity; 
            
            // Sandalye Görselleştirme Mantığı
            const seats: Seat[] = [];
            assigned.forEach(g => {
               seats.push({ isFilled: true, guestId: g.id, name: g.full_name, diet: g.dietary_preference || 'Seçilmedi', isPlusOne: false });
               if (hasPlusOneSeat(g)) {
                   const pName = g.plus_one_name ? `+ ${g.plus_one_name}` : `+ Eşlikçi (Bekleniyor...)`;
                   const pDiet = g.plus_one_name ? (g.plus_one_dietary_preference || 'Seçilmedi') : 'Seçilmedi';
                   seats.push({ isFilled: true, guestId: g.id, name: pName, diet: pDiet, isPlusOne: true, primaryGuestName: g.full_name });
               }
            });
            // Kalan boş sandalyeleri dolduralım
            const remaining = table.capacity - seatsUsed;
            for (let i = 0; i < (remaining > 0 ? remaining : 0); i++) {
              seats.push({ isFilled: false });
            }

            return (
              <Card key={table.id} className={cn("border-0 shadow-lg ring-1 overflow-hidden transition-all", isWarning ? "ring-destructive bg-destructive/5" : "ring-black/5 bg-white")}>
                <CardHeader className={cn("flex flex-row items-center justify-between pb-4 border-b border-black/5", table.shape === 'CIRCLE' ? 'bg-primary/5' : 'bg-muted/30')}>
                  <div className="flex items-center gap-4 w-full">
                    <div className={cn("h-14 w-14 border-[3px] border-primary/30 flex flex-col items-center justify-center text-primary font-bold text-sm bg-white shadow-sm my-auto", table.shape === 'CIRCLE' ? 'rounded-full' : 'rounded-lg')}>
                      <span>{seatsUsed}</span>
                      <span className="text-[10px] uppercase font-normal opacity-70 border-t border-primary/20 w-8 text-center leading-none pt-0.5">{table.capacity}</span>
                    </div>
                    <div className="flex-1 w-full">
                      {editingTableId === table.id ? (
                        <form action={async (fd) => {
                          const newName = fd.get('name') as string;
                          if (newName.trim() !== '') {
                            await renameTable(table.id, newName);
                          }
                          setEditingTableId(null);
                        }} className="flex items-center gap-2 mb-1">
                          <Input name="name" defaultValue={table.name} className="h-8 text-sm w-full max-w-[200px]" autoFocus />
                          <Button type="submit" size="sm" className="h-8 px-3">Kaydet</Button>
                          <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={() => setEditingTableId(null)}>İptal</Button>
                        </form>
                      ) : (
                        <CardTitle className="text-2xl font-heading text-foreground group/title flex items-center gap-2">
                          {table.name}
                          <button onClick={() => setEditingTableId(table.id)} className="opacity-0 group-hover/title:opacity-100 text-muted-foreground hover:text-primary transition-opacity" title="Masa adını düzenle">
                            <Pencil className="h-4 w-4" />
                          </button>
                        </CardTitle>
                      )}
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1 font-medium">
                        {table.shape === 'CIRCLE' ? 'Yuvarlak Masa' : 'Dikdörtgen Masa'}
                        {isFull && <Badge variant="secondary" className="bg-green-100 text-green-800 border-0 text-[10px] uppercase font-bold tracking-wide px-1.5 py-0">Tam Dolu</Badge>}
                        {isWarning && <Badge variant="destructive" className="border-0 text-[10px] uppercase font-bold tracking-wide px-1.5 py-0">Kapasite Aşımı</Badge>}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 bg-gradient-to-b from-transparent to-muted/20">
                    <div className={cn(
                       "grid gap-3",
                       table.shape === 'CIRCLE' ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'
                    )}>
                      {seats.map((seat, i) => (
                        <div key={i} className={cn(
                           "flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-300", 
                           seat.isFilled ? "bg-white shadow-sm ring-1 ring-black/5 border-transparent" : "border-dashed border-primary/20 bg-primary/5"
                        )}>
                          <div className={cn(
                             "h-8 w-8 rounded-full flex items-center justify-center shrink-0", 
                             seat.isFilled 
                               ? (seat.isPlusOne ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary') 
                               : 'bg-transparent text-primary/30'
                          )}>
                             {seat.isFilled ? <User className="h-4 w-4" strokeWidth={2.5} /> : <Armchair className="h-5 w-5" strokeWidth={1.5} />}
                          </div>
                          
                          {seat.isFilled ? (
                             <div className="flex flex-col flex-1 min-w-0 pr-1">
                               <span className={cn("text-sm font-semibold truncate", seat.isPlusOne ? 'text-accent-foreground' : 'text-foreground')}>{seat.name}</span>
                               {seat.isPlusOne && seat.primaryGuestName && (
                                 <span className="text-[10px] text-accent/80 font-medium truncate mt-0.5 leading-none">({seat.primaryGuestName} misafiri)</span>
                               )}
                               {seat.diet && (
                                 <span className="text-[10px] text-muted-foreground font-medium truncate mt-1" title={seat.diet}>{seat.diet}</span>
                               )}
                             </div>
                          ) : (
                             <span className="text-sm text-primary/40 italic font-medium flex-1">Boş Sandalye</span>
                          )}
                          
                          {seat.isFilled && !seat.isPlusOne && (
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               className="h-7 w-7 text-destructive/50 hover:bg-destructive hover:text-white shrink-0 bg-destructive/5" 
                               onClick={() => handleAssign(seat.guestId!, "UNASSIGN")}
                               disabled={loadingGuestId === seat.guestId}
                             >
                               <Trash2 className="h-3.5 w-3.5" />
                             </Button>
                          )}
                        </div>
                      ))}
                    </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

      </div>
    </div>
  );
}
