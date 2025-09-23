import { Prisma } from "@prisma/client";
import type { RequestHandler } from "express";
import {
	type CreateMedicineInput,
	CreateMedicineSchema,
	MedicineListReqSchema,
	MedicineUpdateReqSchema,
	type UpdateMedicineInput,
} from "./medicineModel";
import { medicineService } from "./medicineService";

class MedicineController {
	// GET /api/medicines?page=&pageSize=
	public getByPage: RequestHandler = async (req, res) => {
		const { page, pageSize } = MedicineListReqSchema.shape.query.parse(req.query);
		const out = await medicineService.listWithMeta({ page, pageSize });
		res.status(200).json(out);
	};

	// POST /api/medicines
	public create: RequestHandler<unknown, unknown, CreateMedicineInput> = async (req, res) => {
		try {
			const body = CreateMedicineSchema.parse(req.body);
			const created = await medicineService.createFromBody(body);
			res.status(201).json(created);
		} catch (e: unknown) {
			if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
				return res.status(409).json({ error: "medicineCode already exists" });
			}
			const err = e as Error & { status?: number };
			res.status(err.status ?? 400).json({ error: err.message ?? "create failed" });
		}
	};

	// GET /api/medicines/:id
	public getById: RequestHandler<{ id: string }> = async (req, res) => {
		try {
			const med = await medicineService.getById(req.params.id);
			res.json(med);
		} catch (e: unknown) {
			const err = e as Error & { status?: number };
			res.status(err.status ?? 500).json({ error: err.message ?? "fetch failed" });
		}
	};

	// PATCH /api/medicines/:id
	public update: RequestHandler<{ id: string }, unknown, UpdateMedicineInput> = async (req, res) => {
		try {
			// ตรวจ params+body ด้วย Zod
			const { params, body } = MedicineUpdateReqSchema.parse({ params: req.params, body: req.body });
			const updated = await medicineService.updateById(params.id, body);
			res.json(updated);
		} catch (e: unknown) {
			if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
				return res.status(404).json({ error: "ไม่พบข้อมูล Medicine ที่ต้องการอัปเดต" });
			}
			const err = e as Error & { status?: number };
			res.status(err.status ?? 400).json({ error: err.message ?? "update failed" });
		}
	};

	// DELETE /api/medicines/:id
	public delete: RequestHandler<{ id: string }> = async (req, res) => {
		try {
			const out = await medicineService.deleteById(req.params.id);
			res.json(out);
		} catch (e: unknown) {
			const err = e as Error & { status?: number };
			res.status(err.status ?? 400).json({ error: err.message ?? "delete failed" });
		}
	};
}

export const medicineController = new MedicineController();
