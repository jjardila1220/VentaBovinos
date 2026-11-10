ALTER TABLE "sale" ADD COLUMN "payment_reference" varchar(80);--> statement-breakpoint
UPDATE "sale"
SET "payment_reference" = 'SEED-' || "invoice_number"
WHERE "payment_reference" IS NULL;--> statement-breakpoint
ALTER TABLE "sale" ALTER COLUMN "payment_reference" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_payment_reference_unique" UNIQUE("payment_reference");