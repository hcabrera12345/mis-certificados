import { Certificate } from '@/types';

export interface NotificationLog {
  id: string;
  recipient_phone: string;
  recipient_email: string;
  channel: 'whatsapp' | 'email';
  message: string;
  status: 'sent' | 'delivered';
  sent_at: string;
}

export function sendStudentReleaseNotification(cert: Certificate, studentPhone: string = '+51987654321', studentEmail: string = 'alumno@quinto.app'): NotificationLog[] {
  const certUrl = `https://miscertificados.quinto.app/validar/${cert.hash_sha256}`;
  
  const whatsappMsg = `¡Felicidades ${cert.student_name}! 🎓 Tu pago ha sido verificado por el Administrador. Tu certificado oficial del "${cert.course_title}" (60 hrs) ha sido emitido y está listo para descargar aquí: ${certUrl}`;
  
  const emailMsg = `Estimado/a ${cert.student_name},

Nos complace informarle que su certificado correspondiente al programa "${cert.course_title}" ha sido liberado exitosamente con sello de autenticidad SHA-256.

Puede consultar y descargar su documento en el siguiente enlace:
${certUrl}

Atentamente,
Directorio de Certificación Quinto Academy`;

  console.log('[NOTIFICACIÓN WHATSAPP ENVIADA]:', whatsappMsg);
  console.log('[NOTIFICACIÓN EMAIL ENVIADA]:', emailMsg);

  return [
    {
      id: 'notif-wa-' + Date.now(),
      recipient_phone: studentPhone,
      recipient_email: studentEmail,
      channel: 'whatsapp',
      message: whatsappMsg,
      status: 'delivered',
      sent_at: new Date().toISOString()
    },
    {
      id: 'notif-em-' + Date.now(),
      recipient_phone: studentPhone,
      recipient_email: studentEmail,
      channel: 'email',
      message: emailMsg,
      status: 'delivered',
      sent_at: new Date().toISOString()
    }
  ];
}
