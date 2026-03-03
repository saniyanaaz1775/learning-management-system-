import { prisma } from '../../config/db';

export const videoRepository = {
  async findById(videoId: bigint) {
    return prisma.video.findUnique({
      where: { id: videoId },
      include: {
        section: {
          include: { subject: true },
        },
      },
    });
  },
};
