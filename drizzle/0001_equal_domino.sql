UPDATE "user" SET "role" = 'Cliente' WHERE "role" = 'Vendedor';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('Cliente', 'Administrador');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";