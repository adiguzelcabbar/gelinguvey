'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  let error;
  let hasNetworkError = false;

  try {
    const supabase = await createClient()
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }
    const res = await supabase.auth.signInWithPassword(data)
    error = res.error;
  } catch (err: any) {
    console.error("Supabase Login Error:", err);
    hasNetworkError = true;
  }

  if (hasNetworkError) {
    redirect('/login?message=' + encodeURIComponent('Supabase Bağlantı Hatası: Lütfen URL/Key bilgilerinizi kontrol edin.'))
  }

  if (error) {
    redirect('/login?message=' + encodeURIComponent('Kullanıcı adı veya şifre hatalı, ya da Auth açık değil.'))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  let authData, error, dbError;
  let hasNetworkError = false;

  try {
    const supabase = await createClient()
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const authRes = await supabase.auth.signUp(data)
    authData = authRes.data;
    error = authRes.error;

    if (!error && authData?.user) {
      const dbRes = await supabase.from('couples').insert({
        id: authData.user.id,
        email: data.email,
        bride_name: formData.get('bride_name') as string,
        groom_name: formData.get('groom_name') as string,
        wedding_date: formData.get('wedding_date') as string,
      })
      dbError = dbRes.error;
    }
  } catch (err: any) {
    console.error("Supabase Signup Error:", err);
    hasNetworkError = true;
  }

  if (hasNetworkError) {
    redirect('/signup?message=' + encodeURIComponent('Supabase Bağlantı Hatası oluştu.'))
  }

  if (error) {
    redirect('/signup?message=' + encodeURIComponent('Kayıt olurken hata: ' + error.message))
  }

  if (dbError) {
    redirect('/signup?message=' + encodeURIComponent('Şema Hatası: ' + dbError.message))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
