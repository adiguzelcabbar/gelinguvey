'use server'
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendRsvpEmail(coupleEmail: string, guestName: string, status: string, diet: string, plusOneName: string, plusOneDiet: string) {
  if (!resend) {
    console.log(`[Email Mock] ${coupleEmail} adresine LCV E-postası gönderildi: ${guestName} (${status === 'ATTENDING' ? 'Katılıyor' : 'Katılamıyor'})`);
    return { success: true };
  }

  const subject = `Yeni LCV Yanıtı: ${guestName} - ${status === 'ATTENDING' ? 'Katılıyor ✅' : 'Katılamıyor ❌'}`;
  
  const text = `
Düğününüze yeni bir yanıt geldi!

Misafir: ${guestName}
Durum: ${status === 'ATTENDING' ? 'KATILIYOR' : 'KATILAMIYOR'}
${status === 'ATTENDING' ? `Menü Tercihi: ${diet}` : ''}
${plusOneName ? `\nEşlikçi: ${plusOneName} (Menü: ${plusOneDiet})` : ''}

Tüm detaylar için GelinGüvey panelinize giriş yapabilirsiniz.
  `.trim();

  try {
    await resend.emails.send({
      from: 'GelinGüvey <onboarding@resend.dev>',
      to: coupleEmail,
      subject: subject,
      text: text,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send failed:", error);
    return { error };
  }
}
