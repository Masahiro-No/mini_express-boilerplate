import type { Request, RequestHandler, Response } from "express";
import { medicineService } from "@/api/medicine/medicineService";

class MedicineController {
	public getByPage: RequestHandler = async (req: Request, res: Response) => {
		const page = Number.parseInt(req.query.page as string, 10) || 1;
		const pageSize = Number.parseInt(req.query.pageSize as string, 10) || 10;
		const result = await medicineService.listWithMeta({ page, pageSize });
		res.status(200).json(result);
	};

	public create: RequestHandler = async (req: Request, res: Response) => {
		try {
			const created = await medicineService.createFromBody(req.body);
			return res.status(201).json(created);
		} catch (e: unknown) {
			const status = (e as Error & { status?: number })?.status ?? 400;
			return res.status(status).json({ error: (e as Error)?.message ?? "Create failed" });
		}
	};

	public getById: RequestHandler = async (req: Request, res: Response) => {
		try {
			const med = await medicineService.getById(req.params.id);
			return res.json(med);
		} catch (e: unknown) {
			const status = (e as Error & { status?: number })?.status ?? 404;
			return res.status(status).json({ error: (e as Error)?.message ?? "Fetch failed" });
		}
	};

	public update: RequestHandler = async (req: Request, res: Response) => {
		try {
			const updated = await medicineService.updateById(req.params.id, req.body);
			return res.json(updated);
		} catch (e: unknown) {
			const status = (e as Error & { status?: number })?.status ?? 400;
			return res.status(status).json({ error: (e as Error)?.message ?? "Update failed" });
		}
	};

	public delete: RequestHandler = async (req: Request, res: Response) => {
		try {
			const out = await medicineService.deleteById(req.params.id);
			return res.json(out);
		} catch (e: unknown) {
			const status = (e as Error & { status?: number })?.status ?? 400;
			return res.status(status).json({ error: (e as Error)?.message ?? "Delete failed" });
		}
	};
}

export const medicineController = new MedicineController();
