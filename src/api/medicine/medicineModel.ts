import { z } from "zod";

export const CreateMedicineSchema = z.object({
  medicineCode: z.string().min(1),
  nameEN: z.string().min(1),
  nameTH: z.string().min(1),
  catagory: z.string().min(1),
  amount: z.union([z.number(), z.string()]).optional(),
  current_price: z.union([z.number(), z.string()]).optional(),
  advice: z.string().optional(),
  items: z.array(
    z.object({
      prescriptionId: z.string().uuid(),
      instruction: z.string().optional(),
      amount: z.union([z.number(), z.string()]).optional(),
      price: z.union([z.number(), z.string()]).optional(),
    })
  ).optional(),
});

export const UpdateMedicineSchema = CreateMedicineSchema.partial();
