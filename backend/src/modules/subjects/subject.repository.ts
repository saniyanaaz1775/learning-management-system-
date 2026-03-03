import { prisma } from '../../config/db';

export async function isEnrolled(userId: bigint, subjectId: bigint): Promise<boolean> {
  const e = await prisma.enrollment.findUnique({
    where: { userId_subjectId: { userId, subjectId } },
  });
  return e != null;
}

export async function enrollUser(userId: bigint, subjectId: bigint): Promise<void> {
  await prisma.enrollment.upsert({
    where: { userId_subjectId: { userId, subjectId } },
    create: { userId, subjectId },
    update: {},
  });
}

export const subjectRepository = {
  async findManyPublished(params: { page?: number; pageSize?: number; q?: string }) {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 10));
    const skip = (page - 1) * pageSize;
    const where = params.q
      ? { isPublished: true, OR: [{ title: { contains: params.q } }, { slug: { contains: params.q } }] }
      : { isPublished: true };
    const [items, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subject.count({ where }),
    ]);
    return { items, total, page, pageSize };
  },

  async findById(id: bigint) {
    return prisma.subject.findUnique({
      where: { id },
    });
  },

  async getTree(subjectId: bigint) {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        sections: {
          orderBy: { orderIndex: 'asc' },
          include: {
            videos: { orderBy: { orderIndex: 'asc' } },
          },
        },
      },
    });
    return subject;
  },
};
