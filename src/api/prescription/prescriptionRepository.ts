import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreatePrescriptionInput } from "./prescriptionModel";

export const prescription: CreatePrescriptionInput[] = [
	{
		name_patient: "John Doe",
		name_docter: "Dr. Smith",
		date: new Date(),
		items: [
			{
				medicineCode: "MED123",
				instruction: "Take one tablet daily",
				amount: 30,
			},
		],
	},
];

export class PrescriptionRepository {
	async countPrescriptions() {
		return prisma.prescription.count();
	}
	async listPrescriptions(skip: number, take: number) {
		return prisma.prescription.findMany({
			include: { items: { include: { medicine: true } } },
			orderBy: [{ date: "desc" }, { id: "desc" }],
			skip,
			take,
		});
	}
	async findMedicinesByCodes(codes: string[]) {
		if (codes.length === 0) return [];
		return prisma.medicine.findMany({
			where: { medicineCode: { in: codes } },
		});
	}
	async createPrescription(data: Prisma.PrescriptionCreateInput) {
		return prisma.prescription.create({
			data,
			include: { items: { include: { medicine: true } } },
		});
	}
	async findPrescriptionById(id: string) {
		return prisma.prescription.findUnique({
			where: { id },
			include: { items: { include: { medicine: true } } },
		});
	}
	async deletePrescriptionCascade(id: string) {
		return prisma.$transaction([
			prisma.prescriptionItem.deleteMany({ where: { prescriptionId: id } }),
			prisma.prescription.delete({ where: { id } }),
		]);
	}
}
