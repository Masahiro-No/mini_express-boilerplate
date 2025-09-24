// import { Router } from "express";
// import {prescriptionController} from "./prescriptionController";

// const router = Router();

// // === จาก api/prescription/route.ts (เดิม) ===
// router.get("/", controller.getPrescriptionByPage); // GET /api/prescriptions?page=&pageSize=
// router.post("/", controller.createPrescription); // POST /api/prescriptions

// // === จาก src/app/prescription/[id]/route.ts (เดิม) ===
// router.get("/:id", controller.getPrescriptionById); // GET /api/prescriptions/:id
// router.delete("/:id", controller.deletePrescription); // DELETE /api/prescriptions/:id

// export default router;

import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import {
	CreatePrescriptionSchema,
	PrescriptionCreateReqSchema,
	PrescriptionIdParamSchema,
	PrescriptionListReqSchema,
	PrescriptionListResSchema,
} from "@/api/prescription/prescriptionModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { prescriptionController } from "./prescriptionController";

export const prescriptionRegistry = new OpenAPIRegistry();
export const prescriptionRouter: Router = express.Router();

// prescriptionRegistry.register("CreatePrescriptionItemInput", CreatePrescriptionItemInputSchema);
prescriptionRegistry.registerPath({
	method: "get",
	path: "/prescriptions",
	tags: ["Prescription"],
	request: { query: PrescriptionListReqSchema.shape.query },
	responses: createApiResponse(z.array(PrescriptionListResSchema), "Success"),
});

prescriptionRouter.get("/", validateRequest(PrescriptionListReqSchema), prescriptionController.getPrescriptionByPage);

prescriptionRegistry.registerPath({
	method: "post",
	path: "/prescriptions",
	tags: ["Prescription"],
	request: { body: { content: { "application/json": { schema: CreatePrescriptionSchema } } } },
	responses: createApiResponse(z.array(CreatePrescriptionSchema), "Created"),
});

prescriptionRouter.post("/", validateRequest(PrescriptionCreateReqSchema), prescriptionController.createPrescription);

prescriptionRegistry.registerPath({
	method: "get",
	path: "/prescriptions/{id}",
	tags: ["Prescription"],
	request: {
		params: PrescriptionIdParamSchema.shape.params,
	},
	responses: createApiResponse(CreatePrescriptionSchema, "Get by ID Success"),
});

prescriptionRouter.get("/:id", validateRequest(PrescriptionIdParamSchema), prescriptionController.getPrescriptionById);

prescriptionRegistry.registerPath({
	method: "delete",
	path: "/prescriptions/{id}",
	tags: ["Prescription"],
	request: {
		params: PrescriptionIdParamSchema.shape.params,
	},
	responses: createApiResponse(z.object({ message: z.string() }), "Deleted by ID Success"),
});

prescriptionRouter.delete(
	"/:id",
	validateRequest(PrescriptionIdParamSchema),
	prescriptionController.deletePrescription,
);
