// ใช้เป็น type/shape ระหว่างเลเยอร์ (ไม่ผูกติด Express/DB มากเกินไป)
import type { Decimal } from "@prisma/client/runtime/library";

export interface CreatePrescriptionItemInput {
	medicineCode: string;
	instruction?: string | null;
	amount: Decimal | number | string; // รับได้หลายรูปแบบ เดี๋ยว Service จัดการ
}

export interface CreatePrescriptionInput {
	name_patient: string;
	name_docter: string;
	date?: string | Date;
	items: CreatePrescriptionItemInput[];
}

export interface PaginationQuery {
	page: number; // 1-based
	pageSize: number; // 1..100
}

export interface PaginationMeta {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
	hasPrev: boolean;
	hasNext: boolean;
}
