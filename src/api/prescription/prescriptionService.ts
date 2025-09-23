import { Prisma } from "@prisma/client";
import type { CreatePrescriptionInput, PaginationMeta, PaginationQuery } from "./prescriptionModel";
import * as repo from "./prescriptionRepository";

export async function listWithMeta(q: PaginationQuery) {
	const page = Math.max(q.page || 1, 1);
	const pageSize = Math.min(Math.max(q.pageSize || 10, 1), 100);
	const skip = (page - 1) * pageSize;

	const [total, data] = await Promise.all([repo.countPrescriptions(), repo.listPrescriptions(skip, pageSize)]);

	const meta: PaginationMeta = {
		page,
		pageSize,
		total,
		totalPages: Math.ceil(total / pageSize),
		hasPrev: page > 1,
		hasNext: page * pageSize < total,
	};

	return { data, meta };
}

export async function createFromBody(body: CreatePrescriptionInput) {
	// ดึง medicine ทั้งหมดที่อ้างใน items มาก่อน
	const codes = (body.items ?? []).map((it) => it.medicineCode);
	const medicines = await repo.findMedicinesByCodes(codes);

	// map code -> medicine
	const codeToMedicine: Record<string, (typeof medicines)[number]> = {};
	for (const m of medicines) codeToMedicine[m.medicineCode] = m;

	// เตรียม items สำหรับ create (ตรรกะเดิม)
	const itemsData = (body.items ?? []).map((it) => {
		const med = codeToMedicine[it.medicineCode];
		if (!med) throw new Error(`ไม่พบ medicineCode: ${it.medicineCode}`);
		if (it.amount === undefined || it.amount === null) throw new Error(`ต้องกำหนด amount ของ ${it.medicineCode}`);

		return {
			medicine: { connect: { id: med.id } },
			instruction: it.instruction ?? null,
			amount: new Prisma.Decimal(it.amount as any),
			price: new Prisma.Decimal(med.current_price as any),
		};
	});

	const created = await repo.createPrescription({
		name_patient: body.name_patient,
		name_docter: body.name_docter,
		date: body.date ? new Date(body.date) : new Date(),
		items: { create: itemsData },
	});

	return created;
}

export async function getByIdOr404(id: string) {
	const pres = await repo.findPrescriptionById(id);
	if (!pres) {
		const err: any = new Error("Not found");
		err.status = 404;
		throw err;
	}
	return pres;
}

export async function deleteById(id: string) {
	try {
		await repo.deletePrescriptionCascade(id);
		return { message: "Deleted successfully" };
	} catch (e: any) {
		// Prisma FK error → ให้สถานะ 409 ตามที่คุณตั้งใจไว้
		if (e?.code === "P2003") {
			const err: any = new Error("Cannot delete: related items exist.");
			err.status = 409;
			throw err;
		}
		const err: any = new Error(e?.message ?? "Delete failed");
		err.status = 400;
		throw err;
	}
}
