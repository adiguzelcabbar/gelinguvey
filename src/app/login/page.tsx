import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Link href="/" className="mb-8 flex items-center gap-2 text-foreground font-heading text-2xl">
        <Sparkles className="h-6 w-6 text-primary" />
        Gelin<span className="text-primary italic font-medium">Güvey</span>
      </Link>
      
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <form action={login}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-heading text-center">Hoş Geldiniz</CardTitle>
            <CardDescription className="text-center">
              Çift panelinize giriş yapmak için bilgilerinizi girin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" name="email" type="email" placeholder="ornek@mail.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {params?.message && (
              <p className="text-sm text-destructive font-medium text-center mt-4 bg-destructive/10 p-2 rounded">
                {params.message}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full text-md h-12" type="submit">
              Giriş Yap
            </Button>
            <p className="text-sm text-center text-muted-foreground w-full">
              Hesabınız yok mu?{" "}
              <Link href="/signup" className="text-primary font-medium hover:underline">
                Hemen Üye Olun
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
