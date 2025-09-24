// // ใช้เป็น type/shape ระหว่างเลเยอร์ (ไม่ผูกติด Express/DB มากเกินไป)
// import type { Decimal } from "@prisma/client/runtime/library";

// export interface CreatePrescriptionItemInput {
// 	medicineCode: string;
// 	instruction?: string | null;
// 	amount: Decimal | number | string; // รับได้หลายรูปแบบ เดี๋ยว Service จัดการ
// }

// export interface CreatePrescriptionInput {
// 	name_patient: string;
// 	name_docter: string;
// 	date?: string | Date;
// 	items: CreatePrescriptionItemInput[];
// }

// export interface PaginationQuery {
// 	page: number; // 1-based
// 	pageSize: number; // 1..100
// }

// export interface PaginationMeta {
// 	page: number;
// 	pageSize: number;
// 	total: number;
// 	totalPages: number;
// 	hasPrev: boolean;
// 	hasNext: boolean;
// }

import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type CreatePrescriptionItemInput = z.infer<typeof CreatePrescriptionItemInputSchema>;
export const CreatePrescriptionItemInputSchema = z.object({
	medicineCode: z.string().min(1).max(100),
	instruction: z.string().max(500).optional().nullable(),
	amount: commonValidations.decimalPositive,
});

export type CreatePrescriptionInput = z.infer<typeof CreatePrescriptionSchema>;
export const CreatePrescriptionSchema = z.object({
	name_patient: z.string().min(1).max(200),
	name_docter: z.string().min(1).max(200),
	date: z.preprocess((val) => {
		if (typeof val === "string" || val instanceof Date) return new Date(val);
		return new Date();
	}, z.date()),
	items: z.array(CreatePrescriptionItemInputSchema).min(1),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export const PaginationQuerySchema = z.object({
	page: z.preprocess((val) => (typeof val === "string" ? Number(val) : val), z.number().min(1).default(1)),
	pageSize: z.preprocess(
		(val) => (typeof val === "string" ? Number(val) : val),
		z.number().min(1).max(100).default(10),
	),
});

export interface PaginationMeta {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
	hasPrev: boolean;
	hasNext: boolean;
}

export const PrescriptionListReqSchema = z.object({ query: PaginationQuerySchema });
