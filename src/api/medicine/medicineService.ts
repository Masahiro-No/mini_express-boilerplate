import { Prisma } from "@prisma/client";
import { MedicineRepository } from "./medicineRepository";
import { toDecimalOrUndefined } from "../../common/utils/decimal";

const repo = new MedicineRepository();

function buildCreateData(body: any) {
  return {
    medicineCode: body.medicineCode ?? "",
    nameEN: body.nameEN,
    nameTH: body.nameTH,
    catagory: body.catagory,
    amount: toDecimalOrUndefined(body.amount) ?? new Prisma.Decimal(0),
    current_price: toDecimalOrUndefined(body.current_price) ?? new Prisma.Decimal(0),
    advice: body.advice ?? "",
    items: {
      create: (body.items ?? []).map((it: any) => ({
        prescriptionId: it.prescriptionId,
        instruction: it.instruction ?? "",
        amount: toDecimalOrUndefined(it.amount) ?? new Prisma.Decimal(0),
        price: toDecimalOrUndefined(it.price) ?? new Prisma.Decimal(0),
      })),
    },
  };
}

function buildUpdateData(body: any) {
  const data: any = {};

  // numeric
  const numericFields = ["amount", "current_price", "price"];
  for (const f of numericFields) {
    if (body[f] !== undefined) data[f] = toDecimalOrUndefined(body[f]);
  }

  // strings
  const other = ["medicineCode", "nameEN", "nameTH", "catagory", "advice"];
  for (const f of other) {
    if (body[f] !== undefined) data[f] = body[f];
  }

  if (body.items !== undefined) {
    data.items = {
      deleteMany: {}, // ลบทั้งหมดก่อน แล้วสร้างใหม่
      create: body.items.map((it: any) => ({
        prescriptionId: it.prescriptionId,
        instruction: it.instruction ?? "",
        amount: toDecimalOrUndefined(it.amount) ?? new Prisma.Decimal(0),
        price: toDecimalOrUndefined(it.price) ?? new Prisma.Decimal(0),
      })),
    };
  }

  return data;
}

export const medicineService = {
  list: () => repo.list(),
  getById: async (id: string) => {
    const m = await repo.findById(id);
    return m;
  },
  create: async (body: any) => {
    const data = buildCreateData(body);
    const created = await repo.create(data);
    return created;
  },
  update: async (id: string, body: any) => {
    const data = buildUpdateData(body);
    if (Object.keys(data).length === 0) {
      const err: any = new Error("No data to update");
      err.status = 400;
      throw err;
    }
    return repo.update(id, data);
  },
  deleteHardAndSoftItems: (id: string) => repo.deleteHardAndSoftItems(id),
};
