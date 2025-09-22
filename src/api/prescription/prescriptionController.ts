import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

// =================== จาก api/prescription/route.ts ===================

export async function listPrescriptions(req: Request, res: Response) {
	const page = Math.max(parseInt(String(req.query.page ?? "1"), 10), 1);
	const pageSize = Math.min(Math.max(parseInt(String(req.query.pageSize ?? "10"), 10), 1), 100);

	const [total, data] = await Promise.all([
		prisma.prescription.count(),
		prisma.prescription.findMany({
			include: {
				items: { include: { medicine: true } },
			},
			orderBy: [{ date: "desc" }, { id: "desc" }], // ใส่ id เพื่อให้ลำดับคงที่
			skip: (page - 1) * pageSize,
			take: pageSize,
		}),
	]);

	return res.json({
		data,
		meta: {
			page,
			pageSize,
			total,
			totalPages: Math.ceil(total / pageSize),
			hasPrev: page > 1,
			hasNext: page * pageSize < total,
		},
	});
}

export async function createPrescription(req: Request, res: Response) {
	try {
		const body = req.body;
		// body: { name_patient, name_docter, date, items: [{ medicineCode, instruction?, amount }] }

		// ดึง medicine ที่เกี่ยวข้อง
		const codes = (body.items ?? []).map((it: any) => it.medicineCode);
		const medicines = await prisma.medicine.findMany({
			where: { medicineCode: { in: codes } },
		});

		// แปลงเป็น map: { code -> medicine }
		const codeToMedicine: Record<string, (typeof medicines)[0]> = {};
		medicines.forEach((m) => (codeToMedicine[m.medicineCode] = m));

		// เตรียม data สำหรับ create
		const itemsData = (body.items ?? []).map((it: any) => {
			const med = codeToMedicine[it.medicineCode];
			if (!med) throw new Error(`ไม่พบ medicineCode: ${it.medicineCode}`);
			if (it.amount === undefined) {
				throw new Error(`ต้องกำหนด amount ของ ${it.medicineCode}`);
			}
			return {
				medicineId: med.id,
				instruction: it.instruction ?? null,
				amount: new Prisma.Decimal(it.amount as any), // ผู้ใช้กำหนดเอง
				price: new Prisma.Decimal(med.current_price as any), // ใช้จาก Medicine
			};
		});

		const created = await prisma.prescription.create({
			data: {
				name_patient: body.name_patient,
				name_docter: body.name_docter,
				date: body.date ? new Date(body.date) : new Date(),
				items: { create: itemsData },
			},
			include: {
				items: { include: { medicine: true } },
			},
		});

		return res.status(201).json(created);
	} catch (e: any) {
		console.error(e);
		return res.status(400).json({ error: e?.message ?? "create failed" });
	}
}

// =================== จาก src/app/prescription/[id]/route.ts ===================

export async function getPrescriptionById(req: Request, res: Response) {
	try {
		const { id } = req.params;
		const prescription = await prisma.prescription.findUnique({
			where: { id },
			include: {
				items: { include: { medicine: true } },
			},
		});

		if (!prescription) {
			return res.status(404).json({ error: "Not found" });
		}
		return res.json(prescription);
	} catch (e: any) {
		return res.status(500).json({ error: e?.message ?? "Fetch failed" });
	}
}

export async function deletePrescription(req: Request, res: Response) {
	try {
		const { id } = req.params;

		await prisma.$transaction([
			prisma.prescriptionItem.deleteMany({
				where: { prescriptionId: id },
			}),
			prisma.prescription.delete({
				where: { id },
			}),
		]);

		return res.json({ message: "Deleted successfully" });
	} catch (e: any) {
		// จับ error FK (P2003) ให้สถานะอ่านง่ายขึ้น
		if (e?.code === "P2003") {
			return res.status(409).json({ error: "Cannot delete: related items exist." });
		}
		return res.status(400).json({ error: e?.message ?? "Delete failed" });
	}
}
