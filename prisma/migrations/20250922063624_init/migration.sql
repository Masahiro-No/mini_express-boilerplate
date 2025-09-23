-- CreateTable
CREATE TABLE "public"."Medicine" (
    "id" UUID NOT NULL,
    "medicineCode" TEXT NOT NULL,
    "nameEN" TEXT NOT NULL,
    "nameTH" TEXT NOT NULL,
    "catagory" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "current_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "advice" TEXT,

    CONSTRAINT "Medicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PrescriptionItem" (
    "id" UUID NOT NULL,
    "medicineListed" UUID,
    "prescription" UUID NOT NULL,
    "instruction" TEXT,
    "amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deleteAT" TIMESTAMP(3),

    CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Prescription" (
    "id" UUID NOT NULL,
    "name_patient" TEXT NOT NULL,
    "name_docter" TEXT NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Medicine_medicineCode_key" ON "public"."Medicine"("medicineCode");

-- CreateIndex
CREATE INDEX "PrescriptionItem_prescription_idx" ON "public"."PrescriptionItem"("prescription");

-- CreateIndex
CREATE INDEX "PrescriptionItem_medicineListed_idx" ON "public"."PrescriptionItem"("medicineListed");

-- AddForeignKey
ALTER TABLE "public"."PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_medicineListed_fkey" FOREIGN KEY ("medicineListed") REFERENCES "public"."Medicine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_prescription_fkey" FOREIGN KEY ("prescription") REFERENCES "public"."Prescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
