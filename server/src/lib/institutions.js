import prisma from '../config/db.js';
import { institutionDomainMatches, normalizeEmail } from './crypto.js';

export async function findInstitutionForEmail(email) {
  const emailLower = normalizeEmail(email);
  const institutions = await prisma.institution.findMany({
    where: { status: { in: ['ACTIVE', 'PILOT'] } }
  });
  return institutions.find((inst) => institutionDomainMatches(inst.domain, emailLower)) || null;
}

export async function assertInstitutionalEmail(email) {
  const institution = await findInstitutionForEmail(email);
  if (!institution) {
    const err = new Error(
      'Access is limited to approved university or enterprise domains. Personal emails are not eligible.'
    );
    err.statusCode = 400;
    throw err;
  }
  return institution;
}
