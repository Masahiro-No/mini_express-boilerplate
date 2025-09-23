import { prisma } from "@/lib/prisma";

export class MedicineRepository {
  list() {
    return prisma.medicine.findMany({
      orderBy: { id: "asc" },
      include: {
        items: { where: { deletedAt: null } },
      },
    });
  }

  findById(id: string) {
    return prisma.medicine.findUnique({
      where: { id },
      include: {
        items: {
          include: { prescription: true },
        },
      },
    });
  }

  create(data: any) {
    return prisma.medicine.create({ data });
  }

  update(id: string, data: any) {
    return prisma.medicine.update({
      where: { id },
      data,
      include: { items: { include: { prescription: true } } },
    });
  }

  async deleteHardAndSoftItems(medicineId: string) {
    const exist = await prisma.medicine.findUnique({
      where: { id: medicineId }, select: { id: true }
    });
    if (!exist) {
      const err: any = new Error("Medicine not found");
      err.code = "NOT_FOUND";
      throw err;
    }

    const now = new Date();
    const result = await prisma.$transaction(async (tx) => {
      const softRes = await tx.prescriptionItem.updateMany({
        where: { medicineId, deletedAt: null },
        data: { deletedAt: now },
      });
      await tx.medicine.delete({ where: { id: medicineId } });
      return { softDeletedItemCount: softRes.count };
    });

    return { medicineId, ...result };
  }
}
