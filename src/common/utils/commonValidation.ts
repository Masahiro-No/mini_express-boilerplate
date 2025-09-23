import { z } from "zod";

export const commonValidations = {
	id: z
		.string()
		.refine((data) => !Number.isNaN(Number(data)), "ID must be a numeric value")
		.transform(Number)
		.refine((num) => num > 0, "ID must be a positive number"),
	decimalPositive: z
		.union([z.string(), z.number()])
		.refine((data) => {
			const num = typeof data === "string" ? Number(data) : data;
			return !Number.isNaN(num) && num > 0;
		}, "Amount must be a positive number")
		.transform((data) => (typeof data === "string" ? Number(data) : data)),
	// ... other common validations
};
