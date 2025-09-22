import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: ["query", "error", "warn"], // จะเปิด log query/error ถ้าต้องการ debug
	});

// กัน hot-reload ใน dev ไม่ให้สร้าง client ซ้อน
if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}
