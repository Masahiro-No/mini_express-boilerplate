import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { medicineController } from "@/api/medicine/medicineController";
import {
	CreateMedicineSchema,
	MedicineCreateReqSchema,
	MedicineIdParamSchema,
	MedicineListReqSchema,
	MedicineUpdateReqSchema,
	UpdateMedicineSchema,
} from "@/api/medicine/medicineModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";

export const medicineRegistry = new OpenAPIRegistry();
export const medicineRouter: Router = express.Router();

// (optional) สคีมาสำหรับ read/response
const MedicineReadSchema = CreateMedicineSchema.extend({
	id: z.string().uuid(),
	items: z
		.array(
			z.object({
				id: z.string().uuid(),
				prescriptionId: z.string().uuid(),
				instruction: z.string().nullable().optional(),
				amount: z.number(), // ถ้าคุณ serialize Decimal → number/ string ปรับตามจริง
				price: z.number(),
				// ถ้าคืน prescription ด้วยก็ใส่ต่อ:
				prescription: z
					.object({
						id: z.string().uuid(),
						name_patient: z.string(),
						name_docter: z.string(),
						date: z.string().or(z.date()), // แล้วแต่ format ที่คุณ serialize
					})
					.optional(),
			}),
		)
		.optional(),
});

// GET /medicines
medicineRegistry.registerPath({
	method: "get",
	path: "/medicines",
	tags: ["Medicine"],
	request: { query: MedicineListReqSchema.shape.query },
	responses: createApiResponse(
		z.object({
			data: z.array(MedicineReadSchema),
			meta: z.object({
				page: z.number(),
				pageSize: z.number(),
				total: z.number(),
				totalPages: z.number(),
				hasPrev: z.boolean(),
				hasNext: z.boolean(),
			}),
		}),
		"Success",
	),
});
medicineRouter.get("/", validateRequest(MedicineListReqSchema), medicineController.getByPage);

// POST /medicines
medicineRegistry.registerPath({
	method: "post",
	path: "/medicines",
	tags: ["Medicine"],
	request: { body: { content: { "application/json": { schema: CreateMedicineSchema } } } },
	responses: createApiResponse(MedicineReadSchema, "Created"),
});
medicineRouter.post("/", validateRequest(MedicineCreateReqSchema), medicineController.create);

// GET /medicines/:id
medicineRegistry.registerPath({
	method: "get",
	path: "/medicines/{id}",
	tags: ["Medicine"],
	request: { params: z.object({ id: z.string().uuid() }) },
	responses: createApiResponse(MedicineReadSchema, "Get by ID Success"),
});
medicineRouter.get("/:id", validateRequest(MedicineIdParamSchema), medicineController.getById);

// PATCH /medicines/:id
medicineRegistry.registerPath({
	method: "patch",
	path: "/medicines/{id}",
	tags: ["Medicine"],
	request: {
		params: z.object({ id: z.string().uuid() }),
		body: { content: { "application/json": { schema: UpdateMedicineSchema } } },
	},
	responses: createApiResponse(MedicineReadSchema, "Updated"),
});
medicineRouter.patch("/:id", validateRequest(MedicineUpdateReqSchema), medicineController.update);

// DELETE /medicines/:id
medicineRegistry.registerPath({
	method: "delete",
	path: "/medicines/{id}",
	tags: ["Medicine"],
	request: { params: z.object({ id: z.string().uuid() }) },
	responses: createApiResponse(z.object({ message: z.string() }), "Deleted by ID Success"),
});
medicineRouter.delete("/:id", validateRequest(MedicineIdParamSchema), medicineController.delete);
