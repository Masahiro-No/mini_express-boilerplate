// import type { Request, Response } from "express";
// import * as service from "./prescriptionService";

// export async function getPrescriptionByPage(req: Request, res: Response) {
// 	const { data, meta } = await service.listWithMeta({
// 		page: Number(req.query.page ?? 1),
// 		pageSize: Number(req.query.pageSize ?? 10),
// 	});
// 	return res.json({ data, meta });
// }

// export async function createPrescription(req: Request, res: Response) {
// 	try {
// 		const created = await service.createFromBody(req.body);
// 		return res.status(201).json(created);
// 	} catch (e: unknown) {
// 		console.error(e);
// 		return res.status(400).json({ error: (e as Error)?.message ?? "create failed" });
// 	}
// }

// export async function getPrescriptionById(req: Request, res: Response) {
// 	try {
// 		const pres = await service.getByIdOr404(req.params.id);
// 		return res.json(pres);
// 	} catch (e: unknown) {
// 		const status = (e as Error & { status?: number })?.status ?? 500;
// 		return res.status(status).json({ error: (e as Error)?.message ?? "Fetch failed" });
// 	}
// }

// export async function deletePrescription(req: Request, res: Response) {
// 	try {
// 		const out = await service.deleteById(req.params.id);
// 		return res.json(out);
// 	} catch (e: unknown) {
// 		const status = (e as Error & { status?: number })?.status ?? 400;
// 		return res.status(status).json({ error: (e as Error)?.message ?? "Delete failed" });
// 	}
// }

import type { Request, RequestHandler, Response } from "express";
import {
	PrescriptionCreateReqSchema,
	PrescriptionIdParamSchema,
	PrescriptionListReqSchema,
} from "@/api/prescription/prescriptionModel";
import { prescriptionService } from "@/api/prescription/prescriptionService";

class PrescriptionController {
	public getPrescriptionByPage: RequestHandler = async (req: Request, res: Response) => {
		// const page = Number.parseInt(req.query.page as string, 10) || 1;
		// const pageSize = Number.parseInt(req.query.pageSize as string, 10) || 10;
		const { page, pageSize } = PrescriptionListReqSchema.shape.query.parse(req.query);
		const prescriptionBypage = await prescriptionService.listWithMeta({ page, pageSize });
		res.status(200).send(prescriptionBypage);
	};
	public createPrescription: RequestHandler = async (req: Request, res: Response) => {
		try {
			const body = PrescriptionCreateReqSchema.shape.body.parse(req.body);
			const created = await prescriptionService.createFromBody(body);
			return res.status(201).json(created);
		} catch (e: unknown) {
			console.error(e);
			return res.status(400).json({ error: (e as Error)?.message ?? "create failed" });
		}
	};
	public getPrescriptionById: RequestHandler = async (req: Request, res: Response) => {
		try {
			const id = PrescriptionIdParamSchema.shape.params.parse(req.params).id;
			const pres = await prescriptionService.getPrescriptionById(id);
			return res.json(pres);
		} catch (e: unknown) {
			const status = (e as Error & { status?: number })?.status ?? 500;
			return res.status(status).json({ error: (e as Error)?.message ?? "Fetch failed" });
		}
	};
	public deletePrescription: RequestHandler = async (req: Request, res: Response) => {
		try {
			const id = PrescriptionIdParamSchema.shape.params.parse(req.params).id;
			const out = await prescriptionService.deleteById(id);
			return res.json(out);
		} catch (e: unknown) {
			const status = (e as Error & { status?: number })?.status ?? 400;
			return res.status(status).json({ error: (e as Error)?.message ?? "Delete failed" });
		}
	};
}
export const prescriptionController = new PrescriptionController();
