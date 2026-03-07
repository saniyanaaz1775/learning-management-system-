import PDFDocument from 'pdfkit';
import { prisma } from '../../config/db';
import { isEnrolled } from '../subjects/subject.repository';
import { progressRepository } from '../progress/progress.repository';

export interface CertificateData {
  studentName: string;
  courseTitle: string;
  completedAt: string;
  certificateId: string;
}

export async function getCertificateData(
  userId: bigint,
  subjectId: bigint
): Promise<{ error: string } | CertificateData> {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });
  if (!subject) return { error: 'Course not found' };

  const enrolled = await isEnrolled(userId, subjectId);
  if (!enrolled) return { error: 'You must complete this course to download the certificate' };

  const progress = await progressRepository.getSubjectProgress(userId, subjectId);
  if (!progress || progress.percent_complete < 100)
    return { error: 'Complete this course to unlock your certificate' };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  if (!user) return { error: 'User not found' };

  const completedAt =
    (progress as { completed_at?: string | null }).completed_at ?? new Date().toISOString();
  const certId = `SS-${subjectId}-${userId}-${completedAt.slice(0, 10).replace(/-/g, '')}`;

  return {
    studentName: user.name,
    courseTitle: subject.title,
    completedAt,
    certificateId: certId,
  };
}

export function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 60 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const dateStr = new Date(data.completedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    doc.fontSize(28).font('Helvetica-Bold').text('SkillSphere', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text('Your Universe of Learning', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(22).font('Helvetica-Bold').text('Certificate of Completion', { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(12).font('Helvetica').text('This is to certify that', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(18).font('Helvetica-Bold').text(data.studentName, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text('has successfully completed the course', {
      align: 'center',
    });
    doc.moveDown(0.8);
    doc.fontSize(16).font('Helvetica-Bold').text(data.courseTitle, { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(12).font('Helvetica').text(`Completed on ${dateStr}`, { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(9).font('Helvetica').text(`Certificate ID: ${data.certificateId}`, {
      align: 'center',
    });
    doc.moveDown(2);

    doc.fontSize(10).font('Helvetica').text('_________________________', 60, doc.y);
    doc.text('SkillSphere', 60, doc.y + 14);
    doc.end();
  });
}
