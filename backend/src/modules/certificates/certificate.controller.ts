import { Request, Response } from 'express';
import {
  getCertificateData,
  generateCertificatePDF,
} from './certificate.service';

export async function getCertificate(req: Request, res: Response): Promise<void> {
  try {
    const subjectId = BigInt(req.params.courseId);
    const userId = BigInt(req.user!.id);

    const data = await getCertificateData(userId, subjectId);
    if ('error' in data) {
      res.status(403).json({ error: data.error });
      return;
    }

    const pdf = await generateCertificatePDF(data);
    const filename = `certificate-${data.courseTitle.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', String(pdf.length));
    res.send(pdf);
  } catch (e) {
    console.error('Certificate error:', e);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
}

/** GET certificate metadata (for View Certificate) - returns JSON with same data used for PDF */
export async function getCertificateMeta(req: Request, res: Response): Promise<void> {
  try {
    const subjectId = BigInt(req.params.courseId);
    const userId = BigInt(req.user!.id);

    const data = await getCertificateData(userId, subjectId);
    if ('error' in data) {
      res.status(403).json({ error: data.error });
      return;
    }

    res.json(data);
  } catch (e) {
    console.error('Certificate meta error:', e);
    res.status(500).json({ error: 'Failed to load certificate' });
  }
}
