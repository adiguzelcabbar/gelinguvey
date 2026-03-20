import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "../login/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background p-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 text-foreground font-heading text-2xl">
        <Sparkles className="h-6 w-6 text-primary" />
        Gelin<span className="text-primary italic font-medium">Güvey</span>
      </Link>
      
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <form action={signup}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-heading text-center">Hesap Oluştur</CardTitle>
            <CardDescription className="text-center">
              Düğün davetlilerinizi kolayca yönetmek için üye olun
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bride_name">Gelin Adı</Label>
                <Input id="bride_name" name="bride_name" placeholder="Ayşe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="groom_name">Damat Adı</Label>
                <Input id="groom_name" name="groom_name" placeholder="Ali" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="wedding_date">Düğün Tarihi</Label>
              <Input id="wedding_date" name="wedding_date" type="date" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" name="email" type="email" placeholder="ornek@mail.com" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>
            
            {params?.message && (
              <p className="text-sm text-destructive font-medium text-center mt-4 bg-destructive/10 p-2 rounded">
                {params.message}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full text-md h-12 mt-2" type="submit">
              Üye Ol
            </Button>
            <p className="text-sm text-center text-muted-foreground w-full">
              Zaten hesabınız var mı?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Giriş Yapın
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
