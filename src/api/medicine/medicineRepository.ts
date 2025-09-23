import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type MedicineWithItems = Prisma.MedicineGetPayload<{ include: { items: true } }>;

export type MedicineWithItemsAndPrescription = Prisma.MedicineGetPayload<{
	include: { items: { include: { prescription: true } } };
}>;

export class MedicineRepository {
	async countMedicines() {
		return prisma.medicine.count();
	}

	async listMedicines(skip: number, take: number) {
		return prisma.medicine.findMany({
			include: { items: { where: { deletedAt: null } } },
			orderBy: [{ id: "asc" }],
			skip,
			take,
		});
	}

	async findMedicineById(id: string) {
		return prisma.medicine.findUnique({
			where: { id },
			include: { items: { include: { prescription: true } } },
		});
	}

	async createMedicine(data: Prisma.MedicineCreateInput) {
		return prisma.medicine.create({
			data,
			include: { items: { include: { prescription: true } } },
		});
	}

	async updateMedicine(id: string, data: Prisma.MedicineUpdateInput) {
		return prisma.medicine.update({
			where: { id },
			data,
			include: { items: { include: { prescription: true } } },
		});
	}

	async deleteMedicineCascade(id: string) {
		const exists = await prisma.medicine.findUnique({ where: { id }, select: { id: true } });
		if (!exists) {
			const err = new Error("Not found") as Error & { status?: number; code?: string };
			err.status = 404;
			err.code = "NOT_FOUND";
			throw err;
		}

		const now = new Date();
		return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
			await tx.prescriptionItem.updateMany({
				where: { medicineId: id, deletedAt: null },
				data: { deletedAt: now },
			});
			await tx.medicine.delete({ where: { id } });
			return { message: "Deleted successfully" };
		});
	}
}
