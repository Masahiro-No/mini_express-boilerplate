import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function countPrescriptions() {
	return prisma.prescription.count();
}

export async function listPrescriptions(skip: number, take: number) {
	return prisma.prescription.findMany({
		include: { items: { include: { medicine: true } } },
		orderBy: [{ date: "desc" }, { id: "desc" }],
		skip,
		take,
	});
}

export async function findMedicinesByCodes(codes: string[]) {
	if (codes.length === 0) return [];
	return prisma.medicine.findMany({
		where: { medicineCode: { in: codes } },
	});
}

export async function createPrescription(data: Prisma.PrescriptionCreateInput) {
	return prisma.prescription.create({
		data,
		include: { items: { include: { medicine: true } } },
	});
}

export async function findPrescriptionById(id: string) {
	return prisma.prescription.findUnique({
		where: { id },
		include: { items: { include: { medicine: true } } },
	});
}

export async function deletePrescriptionCascade(id: string) {
	// เหมือนเดิม: ลบ items ก่อน แล้วค่อยลบ prescription
	return prisma.$transaction([
		prisma.prescriptionItem.deleteMany({ where: { prescriptionId: id } }),
		prisma.prescription.delete({ where: { id } }),
	]);
}
