import { Router } from "express";
import * as controller from "./prescriptionController";

const router = Router();

// === จาก api/prescription/route.ts (เดิม) ===
router.get("/", controller.listPrescriptionsMetadata); // GET /api/prescriptions?page=&pageSize=
router.post("/", controller.createPrescription); // POST /api/prescriptions

// === จาก src/app/prescription/[id]/route.ts (เดิม) ===
router.get("/:id", controller.getPrescriptionById); // GET /api/prescriptions/:id
router.delete("/:id", controller.deletePrescription); // DELETE /api/prescriptions/:id

export default router;
