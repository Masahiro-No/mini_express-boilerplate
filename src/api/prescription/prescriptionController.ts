import type { Request, Response } from "express";
import * as service from "./prescriptionService";

export async function listPrescriptions(req: Request, res: Response) {
	const { data, meta } = await service.listWithMeta({
		page: Number(req.query.page ?? 1),
		pageSize: Number(req.query.pageSize ?? 10),
	});
	return res.json({ data, meta });
}

export async function createPrescription(req: Request, res: Response) {
	try {
		const created = await service.createFromBody(req.body);
		return res.status(201).json(created);
	} catch (e: any) {
		console.error(e);
		return res.status(400).json({ error: e?.message ?? "create failed" });
	}
}

export async function getPrescriptionById(req: Request, res: Response) {
	try {
		const pres = await service.getByIdOr404(req.params.id);
		return res.json(pres);
	} catch (e: any) {
		const status = e?.status ?? 500;
		return res.status(status).json({ error: e?.message ?? "Fetch failed" });
	}
}

export async function deletePrescription(req: Request, res: Response) {
	try {
		const out = await service.deleteById(req.params.id);
		return res.json(out);
	} catch (e: any) {
		const status = e?.status ?? 400;
		return res.status(status).json({ error: e?.message ?? "Delete failed" });
	}
}
