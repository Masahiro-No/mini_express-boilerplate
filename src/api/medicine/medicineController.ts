import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { CreateMedicineSchema, UpdateMedicineSchema } from "./medicineModel";
import { medicineService } from "./medicineService";

export async function listMedicines(_req: Request, res: Response) {
	const data = await medicineService.list();
	return res.json(data);
}

export async function getMedicine(req: Request, res: Response) {
	const m = await medicineService.getById(req.params.id);
	if (!m) return res.status(404).json({ error: "Not found" });
	return res.json(m);
}

export async function createMedicine(req: Request, res: Response) {
	try {
		const body = CreateMedicineSchema.parse(req.body);
		const created = await medicineService.create(body);
		res.setHeader("Location", `/api/medicines/${created.id}`);
		return res.status(201).json(created);
	} catch (e: any) {
		return res.status(400).json({ error: e?.message ?? "Create failed" });
	}
}

export async function updateMedicine(req: Request, res: Response) {
	try {
		const body = UpdateMedicineSchema.parse(req.body);
		const updated = await medicineService.update(req.params.id, body);
		return res.json(updated);
	} catch (e: any) {
		if (e instanceof (Prisma as any).PrismaClientKnownRequestError) {
			if (e.code === "P2025") {
				return res.status(404).json({ error: "ไม่พบข้อมูล Medicine ที่ต้องการอัปเดต" });
			}
		}
		const status = e?.status ?? 400;
		return res.status(status).json({ error: e?.message ?? "Update failed" });
	}
}

export async function deleteMedicine(req: Request, res: Response) {
	try {
		const out = await medicineService.deleteHardAndSoftItems(req.params.id);
		return res.json(out);
	} catch (e: any) {
		if (e?.code === "NOT_FOUND") {
			return res.status(404).json({ error: "Not found" });
		}
		return res.status(400).json({ error: e?.message ?? "Delete failed" });
	}
}
