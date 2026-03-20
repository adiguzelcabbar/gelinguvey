'use client'

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { updateMenuDescriptions } from './actions';
import { Settings2, Plus, Trash2 } from 'lucide-react';

export default function MenuSettings({ couple }: { couple: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const defaultMenus = [
    {id: 'standard', name: 'Standart Menü', desc: ''},
    {id: 'vegan', name: 'Vegan Menü', desc: ''},
    {id: 'vegetarian', name: 'Vejetaryen Menü', desc: ''},
    {id: 'child', name: 'Çocuk Menüsü', desc: ''}
  ];

  const [menus, setMenus] = useState<{id: string, name: string, desc: string}[]>(couple?.custom_menus || defaultMenus);

  const handleAddMenu = () => {
    setMenus([...menus, { id: crypto.randomUUID(), name: 'Yeni Menü', desc: '' }]);
  };

  const handleRemoveMenu = (id: string) => {
    if (menus.length <= 1) {
      alert("En az bir menü bulunmalıdır!");
      return;
    }
    const filtered = menus.filter(m => m.id !== id);
    setMenus(filtered);
  };

  const updateMenu = (id: string, field: 'name' | 'desc', value: string) => {
    setMenus(menus.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  async function onSave() {
    setLoading(true);
    setSuccess(false);
    
    // Validate
    if (menus.some(m => m.name.trim() === '')) {
      alert("Lütfen tüm menü isimlerini doldurun.");
      setLoading(false);
      return;
    }

    const res = await updateMenuDescriptions(menus);
    if (!res?.error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } else {
      alert("Hata: " + res.error);
    }
    setLoading(false);
  }

  return (
    <Card className="mt-8 shadow-sm ring-1 ring-black/5 bg-white border-primary/20">
      <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
         <div>
           <CardTitle className="text-xl font-heading flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" /> Dinamik Menü Ayarları
           </CardTitle>
           <CardDescription className="mt-1">Misafirlerinize sunacağınız menüleri (Örn: Standart 1, Balık vb.) tamamen sınırsız bir şekilde çoğaltın, adlandırın ve detaylandırın.</CardDescription>
         </div>
         <Button onClick={handleAddMenu} variant="outline" className="shrink-0 bg-white hover:bg-primary/5 shadow-sm">
           <Plus className="h-4 w-4 mr-2" /> Menü Seçeneği Ekle
         </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-6">
          {menus.map((menu, idx) => (
             <div key={menu.id} className="space-y-4 p-5 bg-muted/10 rounded-xl ring-1 ring-black/5 relative group transition-all hover:bg-muted/20">
               <div className="flex items-center justify-between border-b pb-3 border-black/5">
                 <h4 className="font-medium text-foreground flex items-center gap-2">
                   <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                   Menü Oluşturucu
                 </h4>
                 <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveMenu(menu.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                   <Trash2 className="h-4 w-4" />
                 </Button>
               </div>
               
               <div className="space-y-2">
                 <Label>Menü Adı <span className="text-destructive">*</span></Label>
                 <Input value={menu.name} onChange={(e) => updateMenu(menu.id, 'name', e.target.value)} placeholder="Örn: Balık Menüsü" className="bg-white/80" />
               </div>
               <div className="space-y-2">
                 <Label>Menü İçeriği <span className="text-muted-foreground font-normal ml-1">(Satır satır yazıldığında davetiyede aynen görünür)</span></Label>
                 <Textarea value={menu.desc} onChange={(e) => updateMenu(menu.id, 'desc', e.target.value)} placeholder="Başlangıç: Somon Füme...&#10;Ana Yemek: Levrek..." className="bg-white/80 min-h-[100px] resize-y" />
               </div>
             </div>
          ))}
          
          <div className="xl:col-span-2 pt-4 flex flex-col sm:flex-row items-center justify-end gap-4 border-t mt-2">
            {success && <span className="text-sm font-medium text-green-600 transition-opacity">✅ Dinamik menüler başarıyla kaydedildi!</span>}
            <Button onClick={onSave} disabled={loading} className="w-full sm:w-auto px-10 h-12 text-lg shadow-sm">
               {loading ? 'Kaydediliyor...' : 'Tüm Menüleri Kaydet'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
