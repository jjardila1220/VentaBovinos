CREATE TYPE "public"."bovine_category" AS ENUM('Vacas lecheras', 'Novillos', 'Terneros', 'Toros');--> statement-breakpoint
CREATE TYPE "public"."bovine_status" AS ENUM('Disponible', 'Reservado', 'Vendido');--> statement-breakpoint
CREATE TYPE "public"."movement_type" AS ENUM('Entrada', 'Salida', 'Venta');--> statement-breakpoint
CREATE TYPE "public"."sale_status" AS ENUM('Completado', 'En proceso', 'Cancelado');--> statement-breakpoint
CREATE TYPE "public"."sex" AS ENUM('Macho', 'Hembra');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('Cliente', 'Vendedor', 'Administrador');--> statement-breakpoint
CREATE TABLE "bovine" (
	"id" serial PRIMARY KEY NOT NULL,
	"breed_id" integer NOT NULL,
	"name" varchar(150) NOT NULL,
	"category" "bovine_category" NOT NULL,
	"sex" "sex" NOT NULL,
	"birth_day" date NOT NULL,
	"age" integer NOT NULL,
	"weight" numeric(8, 2) NOT NULL,
	"price" numeric(14, 2) NOT NULL,
	"color" varchar(100),
	"location" varchar(150),
	"description" text,
	"sanitary_history" text,
	"image_urls" text[],
	"status" "bovine_status" DEFAULT 'Disponible' NOT NULL,
	"register_day" date DEFAULT CURRENT_DATE,
	"reserved_by" integer,
	"reserved_at" timestamp with time zone,
	CONSTRAINT "bovine_weight_positive" CHECK ("bovine"."weight" > 0),
	CONSTRAINT "bovine_price_non_negative" CHECK ("bovine"."price" >= 0),
	CONSTRAINT "bovine_age_non_negative" CHECK ("bovine"."age" >= 0)
);
--> statement-breakpoint
CREATE TABLE "breed" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	CONSTRAINT "breed_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "client" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"document" varchar(50) NOT NULL,
	"phone" varchar(50),
	"email" varchar(150),
	"address" varchar(255),
	CONSTRAINT "client_document_unique" UNIQUE("document"),
	CONSTRAINT "client_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"email" varchar(150) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" NOT NULL,
	"client_id" integer,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"cut" varchar(100),
	"weight" numeric(10, 2) DEFAULT '0.00',
	"price_per_kilogram" numeric(14, 2) DEFAULT '0.00',
	"stock" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "product_stock_non_negative" CHECK ("product"."stock" >= 0),
	CONSTRAINT "product_price_kg_non_negative" CHECK ("product"."price_per_kilogram" >= 0),
	CONSTRAINT "product_weight_non_negative" CHECK ("product"."weight" >= 0)
);
--> statement-breakpoint
CREATE TABLE "sale" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"total" numeric(14, 2) NOT NULL,
	"status" "sale_status" DEFAULT 'Completado' NOT NULL,
	"payment_method" varchar(100) NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	CONSTRAINT "sale_invoice_number_unique" UNIQUE("invoice_number"),
	CONSTRAINT "sale_total_non_negative" CHECK ("sale"."total" >= 0)
);
--> statement-breakpoint
CREATE TABLE "sale_detail" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_id" integer NOT NULL,
	"bovine_id" integer,
	"product_id" integer,
	"quantity" integer NOT NULL,
	"unitary_price" numeric(14, 2) NOT NULL,
	"subtotal" numeric(14, 2) NOT NULL,
	"is_bovine" boolean NOT NULL,
	CONSTRAINT "detail_quantity_positive" CHECK ("sale_detail"."quantity" > 0),
	CONSTRAINT "detail_unitary_price_non_negative" CHECK ("sale_detail"."unitary_price" >= 0),
	CONSTRAINT "detail_subtotal_non_negative" CHECK ("sale_detail"."subtotal" >= 0),
	CONSTRAINT "detail_item_exclusive" CHECK (("sale_detail"."bovine_id" IS NOT NULL AND "sale_detail"."product_id" IS NULL AND "sale_detail"."is_bovine" = true AND "sale_detail"."quantity" = 1) OR ("sale_detail"."bovine_id" IS NULL AND "sale_detail"."product_id" IS NOT NULL AND "sale_detail"."is_bovine" = false))
);
--> statement-breakpoint
CREATE TABLE "movement" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "movement_type" NOT NULL,
	"reference" varchar(150),
	"bovine_id" integer,
	"product_id" integer,
	"quantity" integer DEFAULT 1,
	"user_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bovine" ADD CONSTRAINT "bovine_breed_id_breed_id_fk" FOREIGN KEY ("breed_id") REFERENCES "public"."breed"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bovine" ADD CONSTRAINT "bovine_reserved_by_user_id_fk" FOREIGN KEY ("reserved_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_client_id_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."client"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_detail" ADD CONSTRAINT "sale_detail_sale_id_sale_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sale"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_detail" ADD CONSTRAINT "sale_detail_bovine_id_bovine_id_fk" FOREIGN KEY ("bovine_id") REFERENCES "public"."bovine"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_detail" ADD CONSTRAINT "sale_detail_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movement" ADD CONSTRAINT "movement_bovine_id_bovine_id_fk" FOREIGN KEY ("bovine_id") REFERENCES "public"."bovine"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movement" ADD CONSTRAINT "movement_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movement" ADD CONSTRAINT "movement_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;