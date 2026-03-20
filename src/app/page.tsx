
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-background">
      <div className="max-w-3xl w-full space-y-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Badge & Title */}
        <div className="space-y-6">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary shadow-sm">
            <Sparkles className="mr-2 h-4 w-4" />
            <span className="opacity-90">Sürtünmesiz LCV (RSVP) Toplama Sistemi</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-heading tracking-tight text-foreground drop-shadow-sm">
            Gelin<span className="text-primary italic font-medium">Güvey</span>
          </h1>
          
          <p className="text-2xl md:text-3xl font-heading font-normal text-muted-foreground max-w-2xl mx-auto leading-relaxed mt-4">
            Davetli sayısında kendi kendinize <span className="text-accent underline decoration-accent/30 underline-offset-4">gelin güvey</span> olmayın.
          </p>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link 
            href="/login" 
            className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto font-medium"
          >
            Giriş Yap / Üye Ol <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
          <Card className="bg-card/60 backdrop-blur-md border border-primary/10 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-foreground">SMS ile Davet</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Misafirleriniz uygulama indirmeden, SMS ile gelen sihirli linke tıklayarak kolayca katılıp katılamayacağını bildirsin.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60 backdrop-blur-md border border-primary/10 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-foreground">Anlık İstatistik</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Mutfak için Vegan veya Çocuk menüsü sayılarını şık bir gösterge panelinde anında görün. Kontrol sizde olsun.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60 backdrop-blur-md border border-primary/10 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-foreground">Sıfır Stres</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Kim geliyor, kim gelmiyor belirsizliğini ortadan kaldırarak; düğün stresinizi ve fazla mekan/yemek masraflarınızı azaltın.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
