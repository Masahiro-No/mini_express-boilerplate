import { Prisma } from "@prisma/client";

export function toDecimalOrUndefined(val: unknown) {
  if (val === undefined || val === null || val === "") return undefined;
  const n = Number(val);
  if (Number.isNaN(n)) throw new Error("ต้องเป็นตัวเลข");
  return new Prisma.Decimal(val as any);
}
