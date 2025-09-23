import { Prisma } from "@prisma/client";

export function toDecimal(v: unknown | undefined): Prisma.Decimal | undefined {
	if (v === undefined || v === null || v === "") return undefined;
	const n = Number(v);
	if (Number.isNaN(n)) {
		const err = new Error("ต้องเป็นตัวเลข") as Error & { status?: number };
		err.status = 400;
		throw err;
	}
	// ตอนนี้ v เป็น string | number ได้ชัวร์
	return new Prisma.Decimal(v as string | number);
}
