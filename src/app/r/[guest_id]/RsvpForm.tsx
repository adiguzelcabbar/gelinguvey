'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, CheckCircle2, XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/utils/supabase/client';
import { sendRsvpEmail } from './actions';

export default function RsvpForm({ guest, couple }: { guest: any, couple: any }) {
  const customMenus: {id: string, name: string, desc: string}[] = couple?.custom_menus || [
    {id: 'standard', name: 'Standart Menü', desc: ''},
    {id: 'vegan', name: 'Vegan Menü', desc: ''},
    {id: 'vegetarian', name: 'Vejetaryen Menü', desc: ''},
    {id: 'child', name: 'Çocuk Menüsü', desc: ''}
  ];

  const fallbackMenuId = customMenus[0]?.id || 'standard';

  const [status, setStatus] = useState<string>(guest.rsvp_status);
  const [diet, setDiet] = useState<string>(guest.dietary_preference || fallbackMenuId);
  const [plusOne, setPlusOne] = useState<string>(guest.plus_one_name || '');
  const [plusOneDiet, setPlusOneDiet] = useState<string>(guest.plus_one_dietary_preference || fallbackMenuId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(guest.rsvp_status !== 'PENDING');
  const router = useRouter();

  const handleRsvp = async (newStatus: string) => {
    setStatus(newStatus);
    if (newStatus === 'DECLINED') {
      submitForm('DECLINED', fallbackMenuId, '', fallbackMenuId);
    }
  };

  const submitForm = async (finalStatus: string, finalDiet: string, finalPlusOne: string, finalPlusOneDiet: string) => {
    setIsSubmitting(true);
    const supabase = createClient();
    
    await supabase.from('guests').update({
      rsvp_status: finalStatus,
      dietary_preference: finalDiet,
      plus_one_name: finalPlusOne,
      plus_one_dietary_preference: finalPlusOneDiet
    }).eq('id', guest.id);

    if (couple?.email) {
      const dietName = customMenus.find(m => m.id === finalDiet)?.name || finalDiet;
      const poDietName = customMenus.find(m => m.id === finalPlusOneDiet)?.name || finalPlusOneDiet;
      await sendRsvpEmail(couple.email, guest.full_name, finalStatus, dietName, finalPlusOne, poDietName);
    }

    setIsSubmitting(false);
    setSubmitted(true);
    router.refresh();
  };

  if (submitted) {
    return (
      <div className="w-full text-center space-y-8 animate-in zoom-in-95 duration-500 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl ring-1 ring-black/5">
        <div className="flex justify-center mb-6">
           <div className={`h-24 w-24 rounded-full flex items-center justify-center ${status === 'ATTENDING' ? 'bg-primary/10' : 'bg-destructive/10'}`}>
             {status === 'ATTENDING' ? (
                <CheckCircle2 className="h-12 w-12 text-primary" />
             ) : (
                <XCircle className="h-12 w-12 text-destructive" />
             )}
           </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-heading text-foreground">
          {status === 'ATTENDING' ? 'Harika, görüşmek üzere!' : 'Teşekkürler, sağlık olsun!'}
        </h1>
        <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
          Yanıtınız <strong className="text-foreground">{couple?.bride_name} & {couple?.groom_name}</strong> çiftine başarıyla iletildi.
        </p>
        <Button variant="outline" onClick={() => setSubmitted(false)} className="mt-8 rounded-full h-12 px-8 font-medium">
          Yanıtımı Değiştir
        </Button>
      </div>
    );
  }

  const selectedGuestMenu = customMenus.find(m => m.id === diet);
  const selectedPlusOneMenu = customMenus.find(m => m.id === plusOneDiet);

  return (
    <Card className="shadow-2xl border-0 ring-1 ring-black/5 bg-white/90 backdrop-blur-xl overflow-hidden rounded-3xl">
       <CardHeader className="text-center space-y-4 pb-10 pt-10 border-b border-primary/5 bg-gradient-to-b from-primary/10 to-transparent">
         <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-sm mb-2 ring-1 ring-primary/20">
           <Sparkles className="h-7 w-7 text-primary" />
         </div>
         <CardTitle className="text-3xl font-heading leading-tight text-foreground">
           Hoş geldin {guest.full_name},
         </CardTitle>
         <CardDescription className="text-xl font-light text-foreground pb-2 px-2 leading-relaxed">
           <span className="font-medium text-primary">{couple?.bride_name} & {couple?.groom_name}</span> olarak GelinGüvey oluyoruz, yanımızda mısın?
         </CardDescription>
       </CardHeader>
       <CardContent className="pt-8 space-y-8 px-6 md:px-10 pb-10">
         <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              variant={status === 'ATTENDING' ? 'default' : 'outline'}
              className={`flex-1 h-20 text-xl md:text-2xl rounded-2xl transition-all duration-300 font-medium ${status === 'ATTENDING' ? 'shadow-lg ring-2 ring-primary ring-offset-2 scale-[1.02]' : 'hover:border-primary/50 text-foreground'}`}
              onClick={() => handleRsvp('ATTENDING')}
            >
              Katılıyorum
            </Button>
            <Button 
              size="lg" 
              variant={status === 'DECLINED' ? 'destructive' : 'outline'}
              className={`flex-1 h-20 text-xl md:text-2xl rounded-2xl transition-all duration-300 font-medium ${status === 'DECLINED' ? 'shadow-lg ring-2 ring-destructive ring-offset-2 scale-[1.02]' : 'hover:border-destructive/50 hover:text-destructive text-foreground'}`}
              onClick={() => handleRsvp('DECLINED')}
            >
              Katılamıyorum
            </Button>
         </div>

         {status === 'ATTENDING' && (
           <div className="space-y-8 pt-8 border-t border-primary/10 animate-in slide-in-from-top-4 duration-500">
             <div className="space-y-3">
               <Label className="text-base font-semibold text-foreground flex items-center gap-2">Menü Tercihiniz</Label>
               <Select value={diet} onValueChange={(val) => setDiet(val || fallbackMenuId)}>
                 <SelectTrigger className="h-14 text-md bg-white border-primary/20 hover:border-primary/40 focus:ring-primary/20 transition-all rounded-xl">
                   <SelectValue placeholder="Menü seçin" />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl overflow-hidden">
                   {customMenus.map(menu => (
                     <SelectItem key={menu.id} value={menu.id} className="py-3 text-base cursor-pointer">
                       {menu.name}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               
               {selectedGuestMenu?.desc && (
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 text-sm text-foreground/80 whitespace-pre-line animate-in fade-in slide-in-from-top-2">
                     <strong className="text-primary flex items-center gap-1.5 mb-1.5 opacity-90">
                       <Info className="h-4 w-4" /> Mutfaktan Not:
                     </strong>
                     {selectedGuestMenu.desc}
                  </div>
               )}
             </div>

             {guest.plus_one_allowed && (
               <div className="space-y-5 p-5 bg-accent/5 rounded-2xl border border-accent/20">
                 <div>
                   <Label className="text-base font-semibold text-accent-foreground flex items-center">
                     <Sparkles className="h-4 w-4 mr-2" /> +1 Eşlikçi Hakkınız Var
                   </Label>
                   <p className="text-sm text-muted-foreground/80 mt-1 mb-3">Sizinle gelecek kişinin adını ve menüsünü eklerseniz hazırlığımızı daha iyi yapabiliriz.</p>
                   <Input 
                     placeholder="Eşlikçi Adı Soyadı (İsteğe Bağlı)" 
                     value={plusOne} 
                     onChange={(e) => setPlusOne(e.target.value)} 
                     className="h-14 bg-white border-accent/20 focus-visible:ring-accent/20 rounded-xl px-4 text-base"
                   />
                 </div>
                 {plusOne.trim() !== '' && (
                   <div className="space-y-3 pt-2 border-t border-accent/10 animate-in fade-in">
                     <Label className="text-sm font-semibold text-accent-foreground">Eşlikçinizin Menü Tercihi</Label>
                     <Select value={plusOneDiet} onValueChange={(val) => setPlusOneDiet(val || fallbackMenuId)}>
                       <SelectTrigger className="h-12 text-md bg-white border-accent/20 focus:ring-accent/20 rounded-lg">
                         <SelectValue placeholder="Menü seçin" />
                       </SelectTrigger>
                       <SelectContent className="rounded-lg">
                         {customMenus.map(menu => (
                           <SelectItem key={menu.id} value={menu.id} className="py-2">
                             {menu.name}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>

                     {selectedPlusOneMenu?.desc && (
                        <div className="p-3 bg-white/60 rounded-lg border border-accent/20 text-xs text-muted-foreground whitespace-pre-line animate-in fade-in flex flex-col">
                           <strong className="text-accent flex items-center gap-1.5 mb-1 opacity-90">
                             <Info className="h-3.5 w-3.5" /> Eşlikçi Menüsü İçeriği:
                           </strong>
                           {selectedPlusOneMenu.desc}
                        </div>
                     )}
                   </div>
                 )}
               </div>
             )}

             <Button 
               size="lg" 
               className="w-full h-16 text-xl md:text-2xl font-heading rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]" 
               onClick={() => submitForm('ATTENDING', diet, plusOne, plusOneDiet)}
               disabled={isSubmitting}
             >
               {isSubmitting ? 'Kaydediliyor...' : 'Yanıtımı Gönder'}
             </Button>
           </div>
         )}
       </CardContent>
    </Card>
  );
}
