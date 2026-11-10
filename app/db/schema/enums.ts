import { pgEnum } from "drizzle-orm/pg-core";

export const sexEnum = pgEnum("sex", ["Macho", "Hembra"]);

export const bovineStatusEnum = pgEnum("bovine_status", [
  "Disponible",
  "Reservado",
  "Vendido"
]);

export const bovineCategoryEnum = pgEnum("bovine_category", [
  "Vacas lecheras",
  "Novillos",
  "Terneros",
  "Toros"
]);

export const saleStatusEnum = pgEnum("sale_status", [
  "Completado",
  "En proceso",
  "Cancelado"
]);

export const userRoleEnum = pgEnum("user_role", [
  "Cliente",
  "Administrador"
]);

export const movementTypeEnum = pgEnum("movement_type", [
  "Entrada",
  "Salida",
  "Venta"
]);
