import { PaymentReceipt, Certificate } from '@/types';

export function exportReceiptsToCSV(receipts: PaymentReceipt[]) {
  const headers = ['ID Comprobante', 'Alumno', 'Programa Academico', 'Op Code OCR', 'Monto USD', 'Fecha Pago', 'Estado Aprobacion'];
  const rows = receipts.map((r) => [
    r.id,
    `"${r.student_name}"`,
    `"${r.course_title}"`,
    r.extracted_op_code,
    r.extracted_amount.toFixed(2),
    r.extracted_date,
    r.admin_approval_status
  ]);

  const csvLines = [headers.join(','), ...rows.map((row) => row.join(','))];
  const csvContent = csvLines.join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Reporte_Comprobantes_MisCertificados.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCertificatesToCSV(certificates: Certificate[]) {
  const headers = ['ID Certificado', 'Graduado', 'Curso', 'Horas Lectivas', 'Fecha Emision', 'Hash SHA-256'];
  const rows = certificates.map((c) => [
    c.id,
    `"${c.student_name}"`,
    `"${c.course_title}"`,
    c.academic_hours,
    c.issued_at,
    c.hash_sha256
  ]);

  const csvLines = [headers.join(','), ...rows.map((row) => row.join(','))];
  const csvContent = csvLines.join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Reporte_Certificados_Emitidos.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
