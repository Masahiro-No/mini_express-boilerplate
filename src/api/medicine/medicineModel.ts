import { z } from "zod";
import { commonValidations } from "@/common/utils/commonValidation";

const decimalPositive = commonValidations.decimalPositive;

export const CreateMedicineItemInputSchema = z.object({
	prescriptionId: z.string().uuid(),
	instruction: z.string().max(500).optional().nullable(),
	amount: decimalPositive.optional(),
	price: decimalPositive.optional(),
});

export const CreateMedicineSchema = z.object({
	medicineCode: z.string().min(1).max(100),
	nameEN: z.string().min(1).max(200),
	nameTH: z.string().min(1).max(200),
	catagory: z.string().min(1).max(200),
	amount: decimalPositive.optional(),
	current_price: decimalPositive.optional(),
	advice: z.string().optional().nullable(),
	items: z.array(CreateMedicineItemInputSchema).optional(),
});

export const UpdateMedicineSchema = CreateMedicineSchema.partial();

export const PaginationQuerySchema = z.object({
	page: z.preprocess((v) => (typeof v === "string" ? Number(v) : v), z.number().min(1).default(1)),
	pageSize: z.preprocess((v) => (typeof v === "string" ? Number(v) : v), z.number().min(1).max(100).default(10)),
});

// ---- Types ----
export type CreateMedicineInput = z.infer<typeof CreateMedicineSchema>;
export type UpdateMedicineInput = z.infer<typeof UpdateMedicineSchema>;
export type CreateMedicineItemInput = z.infer<typeof CreateMedicineItemInputSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

// ---- Wrappers for validateRequest ----
export const MedicineListReqSchema = z.object({ query: PaginationQuerySchema });
export const MedicineCreateReqSchema = z.object({ body: CreateMedicineSchema });
export const MedicineIdParamSchema = z.object({ params: z.object({ id: z.string().uuid() }) });
export const MedicineUpdateReqSchema = z.object({
	params: z.object({ id: z.string().uuid() }),
	body: UpdateMedicineSchema,
});
