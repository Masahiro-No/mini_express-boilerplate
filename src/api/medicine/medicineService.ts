import { Prisma } from "@prisma/client";
import type { CreateMedicineInput, CreateMedicineItemInput, UpdateMedicineInput } from "@/api/medicine/medicineModel";
import { MedicineRepository } from "@/api/medicine/medicineRepository";
import { toDecimal } from "@/common/utils/decimal";

const mapItem = (it: CreateMedicineItemInput) => ({
	prescription: { connect: { id: it.prescriptionId } },
	instruction: it.instruction ?? null,
	amount: it.amount !== undefined ? new Prisma.Decimal(it.amount as number) : new Prisma.Decimal(0),
	price: it.price !== undefined ? new Prisma.Decimal(it.price as number) : new Prisma.Decimal(0),
});

export class MedicineService {
	constructor(private readonly repo: MedicineRepository = new MedicineRepository()) {}

	async listWithMeta(req: { page: number; pageSize: number }) {
		const page = Math.max(req.page || 1, 1);
		const pageSize = Math.min(Math.max(req.pageSize || 10, 1), 100);
		const skip = (page - 1) * pageSize;

		const [total, data] = await Promise.all([this.repo.countMedicines(), this.repo.listMedicines(skip, pageSize)]);

		const meta = {
			page,
			pageSize,
			total,
			totalPages: Math.max(1, Math.ceil(total / pageSize)),
			hasPrev: page > 1,
			hasNext: page * pageSize < total,
		};

		return { data, meta };
	}

	async createFromBody(body: CreateMedicineInput) {
		const data: Prisma.MedicineCreateInput = {
			medicineCode: body.medicineCode,
			nameEN: body.nameEN,
			nameTH: body.nameTH,
			catagory: body.catagory,
			amount: toDecimal(body.amount) ?? new Prisma.Decimal(0),
			current_price: toDecimal(body.current_price) ?? new Prisma.Decimal(0),
			advice: body.advice ?? null,
			items: body.items ? { create: body.items.map(mapItem) } : undefined,
		};
		return this.repo.createMedicine(data);
	}

	async getById(id: string) {
		const med = await this.repo.findMedicineById(id);
		if (!med) {
			const err = new Error("Not found") as Error & { status?: number };
			err.status = 404;
			throw err;
		}
		return med;
	}

	async updateById(id: string, body: UpdateMedicineInput) {
		const patch: Prisma.MedicineUpdateInput = {};

		if (body.medicineCode !== undefined) patch.medicineCode = body.medicineCode;
		if (body.nameEN !== undefined) patch.nameEN = body.nameEN;
		if (body.nameTH !== undefined) patch.nameTH = body.nameTH;
		if (body.catagory !== undefined) patch.catagory = body.catagory;
		if (body.advice !== undefined) patch.advice = body.advice ?? null;

		if (body.amount !== undefined) patch.amount = toDecimal(body.amount);
		if (body.current_price !== undefined) patch.current_price = toDecimal(body.current_price);

		if (body.items !== undefined) {
			patch.items = { deleteMany: {}, create: body.items.map(mapItem) };
		}

		if (Object.keys(patch).length === 0) {
			const err = new Error("No data to update") as Error & { status?: number };
			err.status = 400;
			throw err;
		}

		return this.repo.updateMedicine(id, patch);
	}

	deleteById(id: string) {
		return this.repo.deleteMedicineCascade(id);
	}
}

export const medicineService = new MedicineService();
