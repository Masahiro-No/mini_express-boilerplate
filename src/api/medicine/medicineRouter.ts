import { Router } from "express";
import {
  listMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "./medicineController";

export const medicineRouter = Router();

medicineRouter.get("/", listMedicines);
medicineRouter.post("/", createMedicine);
medicineRouter.get("/:id", getMedicine);
medicineRouter.patch("/:id", updateMedicine);
medicineRouter.delete("/:id", deleteMedicine);
