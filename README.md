# GanadoCarnes 🐂

Plataforma web responsive para la comercialización de bovinos (ganado lechero y carnal) en Colombia. Cumple con la identidad visual corporativa (#B3202A, #F9E3E3), las 12 pantallas especificadas, reglas de negocio, roles de usuario, validaciones numéricas, control de inventario en tiempo real y facturación oficial con índice único.

---

## 🚀 Tecnologías Utilizadas (Stack)

- **Frontend:** React 19 + TypeScript + Remix + Vite.
- **Estilos:** Tailwind CSS 4 con paleta personalizada:
  - Rojo principal: `#B3202A`
  - Rojo oscuro para encabezados y hover: `#8B1820`
  - Fondo rosa claro en secciones destacadas: `#F9E3E3`
  - Tarjetas en fondo blanco con bordes redondeados y sombras suaves.
- **Iconografía:** Lucide React (íconos zootécnicos y comerciales).
- **Capa de Servicios y Persistencia:** Servicios server-side con Drizzle ORM y PostgreSQL. Los bovinos, usuarios, ventas y movimientos se almacenan en la base de datos; no se utiliza `localStorage` ni mock data en el runtime.

---

## 👥 Usuarios de Prueba y Credenciales

Puede iniciar sesión normalmente desde la pantalla de **Inicio de sesión**. Las cuentas iniciales se crean mediante el seed de PostgreSQL:

| Rol | Correo Electrónico | Contraseña | Permisos y Alcance |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@ganadocarnes.com` | `admin123` | **Acceso total:** Catálogo, compras, registro/edición/eliminación de bovinos (CRUD), inventario completo, reportes consolidados con exportación a CSV y gestión de usuarios. |
| **Cliente** | `cliente@ganadocarnes.com` | `cliente123` | **Comercial:** Catálogo, filtros, detalle técnico, carrito de compras, checkout con factura y visualización de sus comprobantes. |

---

## 📱 Pantallas Desarrolladas (12 Vistas Completas)

1. **Inicio (Página Principal):**
   - Banner con el título *"Ganado Lechero y Ganado Carnal"* y eslogan *"Calidad, confianza y el mejor precio"*.
   - Barra de búsqueda con botón **Filtrar**.
   - Sección *"Nuestros productos"* con fondo `#F9E3E3` y tarjetas de categoría (Vacas lecheras, Novillos, Terneros, Toros) con precio desde y botón *"Ver más"*.
   - Muestra de ejemplares destacados y sellos de garantía ICA.

2. **Catálogo:**
   - Título *"Bovinos"* con breadcrumb (*Inicio > Catálogo*).
   - Columna izquierda de filtros: Categoría, Raza, Rango de peso (kg), Rango de edad (meses), Sexo, Rango de precio ($), botones *"Aplicar filtros"* y *"Limpiar filtros"*.
   - Cuadrícula responsiva de tarjetas (4 cols escritorio, 2 tablet, 1 móvil) con imagen, nombre, precio formateado `$ 2.500.000`, botón *"Ver más"*.
   - Selector de ordenamiento (precio, peso, más reciente) y paginación.

3. **Detalle del Bovino:**
   - Galería con imagen principal y miniaturas.
   - Nombre, precio en COP, descripción corta.
   - Indicador de estado: *Disponible* (verde), *Reservado* (amarillo) o *Vendido* (rojo).
   - Tabla de atributos: ID, raza, sexo, edad calculada, peso, color, ubicación, fecha de registro, historial sanitario ICA resumido.
   - Botón *"Agregar al carrito"* si está disponible. Si no, muestra el motivo y se deshabilita.
   - Pestañas interactivas: *Descripción*, *Características*, *Ubicación*.
   - Solo para Administradores: botones *"Editar"* y *"Eliminar"* (con modal de confirmación).

4. **Formulario de Registro / Edición de Bovino (Solo Administradores):**
   - Campos: ID (manual o generado automáticamente único), nombre, raza, sexo, fecha de nacimiento (auto-calcula la edad en meses), peso en kg (> 0), color, categoría, precio (> 0), ubicación, descripciones, galería de imágenes.
   - Validación en tiempo real y mensajes de error en español bajo cada campo.

5. **Carrito de Compras:**
   - Lista de bovinos con imagen, nombre, precio y botón eliminar.
   - **SIN controles de cantidad**, porque cada bovino es único.
   - Resumen del pedido con subtotal, envío gratis y total, actualizado en tiempo real.
   - Botón *"Finalizar compra"* y enlace *"Seguir comprando"*. Estado vacío con llamado a la acción.

6. **Checkout (3 Pasos):**
   - **Paso 1:** Datos del comprador (nombre, documento/NIT, teléfono, correo, dirección del predio, municipio).
   - **Paso 2:** Método de pago simulado (Transferencia Bancaria, Efectivo en Predio, Tarjeta de Crédito, PSE).
   - **Paso 3:** Confirmación con resumen de cabezas, datos y total.

7. **Comprobante o Factura:**
   - Formato oficial con índice consecutivo único: `FAC-AAAA-000001` (ej. `FAC-2026-000006`).
   - Fecha y hora exacta, datos del comprador, referencia de pago simulada, tabla de bovinos con ID, precio, subtotal, total y estado *"Completado"*.
   - Botones *"Imprimir"* (con estilos limpios para impresión en papel) y *"Descargar PDF"*.

8. **Inicio de Sesión y Registro:**
   - Formulario de login (correo y contraseña oculta) y de registro de usuario.
   - Mensajes de error genéricos (*"Credenciales inválidas"*).
   - Autenticación mediante sesión server-side y control de acceso por rol.

9. **Historial de Ventas (Solo Administrador):**
   - Filtros por rango de fechas, estado (*Completado*, *En proceso*, *Cancelado*), producto y número de factura.
   - Tabla con fecha, factura, producto, cantidad, total y estado.
   - Clic en cualquier fila abre el comprobante detallado. Paginación.

10. **Inventario (Solo Administrador):**
    - Tabla con ID, producto, cantidad, estado (*Disponible*, *Reservado*, *Vendido*). Stock actualizado tras cada compra.
    - Pestaña de Movimientos (Kárdex): entradas, salidas y ventas con fecha, tipo, referencia y usuario.

11. **Reportes Consolidados (Solo Administrador):**
    - Selector de tipo (*Ventas*, *Inventario*, *Movimientos*), rango de fechas y botón *"Generar"*.
    - Gráfico de barras responsivo por categoría/producto en COP, tarjetas con métricas totales y botón *"Exportar a CSV"*.

12. **Gestión de Usuarios (Solo Administrador):**
    - Tabla de usuarios con rol (*Cliente*, *Administrador*), selector para cambiar de rol y botón para activar/desactivar cuentas.

13. **Páginas Adicionales:**
    - **Nosotros:** Misión ganadera, compromiso de sanidad y trazabilidad.
    - **Contacto:** Sedes, líneas de atención y formulario directo.

---

## ⚖️ Reglas de Negocio Implementadas

1. **Unicidad e ID Único:** Cada bovino posee un identificador único (ej. `BOV-001`) y solo se puede vender una sola vez.
2. **Reserva en Carrito:** Al agregar un bovino al carrito, se marca automáticamente como `"Reservado"`. Si otro usuario intenta agregarlo, el sistema le impide la acción y le notifica: *"Este bovino ya no está disponible (ha sido reservado por otro usuario)"*.
3. **Liberación Automática:** Al remover el bovino del carrito, este se libera inmediatamente y vuelve al estado `"Disponible"`.
4. **Cierre de Venta:** Al completar la compra en checkout, el bovino pasa de forma irreversible a `"Vendido"`, el inventario se descuenta (cantidad 0), se registra el movimiento en el kárdex y se emite la factura única `FAC-2026-XXXXXX`.
5. **Pago provisional:** El sistema genera y almacena una referencia `MOCK-*` para validar el flujo; no conecta todavía con una pasarela de pago real ni gestiona despacho o entrega.
5. **Validación Numérica:** Ningún valor de precio, peso o edad puede ser menor o igual a cero.
6. **Protección de Rutas:** Si un usuario con rol Cliente intenta acceder a pantallas administrativas, es redirigido a Inicio con una notificación toast de acceso restringido.

---

## 💻 Instrucciones para Ejecutar en WSL / Local

### 1. Requisitos Previos
- **Bun** (v1.1+ instalado en WSL/Linux: `curl -fsSL https://bun.sh/install | bash`).
- **PostgreSQL** corriendo en `localhost:5432` con una base de datos llamada `carnes` y usuario `postgres`:
  ```bash
  # En WSL / Ubuntu:
  sudo service postgresql start
  sudo -u postgres psql -c "CREATE DATABASE carnes;"
  ```

### 2. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto (basado en `.env.example`):
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=carnes
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
SESSION_SECRET=un_secreto_muy_seguro_para_firmar_cookies_de_remix_2026
```

### 3. Instalación de Dependencias
```bash
bun install
```

### 4. Migraciones y Carga de Datos (Seed)
Aplica las migraciones SQL generadas por Drizzle Kit y siembra los datos de prueba (razas, clientes, 13 bovinos, cortes cárnicos, facturas y usuarios):
```bash
# Aplicar migraciones SQL a la base 'carnes'
bun run migrate

# Sembrar los datos de prueba iniciales
bun run seed
```

### 5. Iniciar Servidor de Desarrollo
```bash
bun run dev
```
Abre tu navegador en `http://localhost:5173`.

### 6. Otros Scripts Disponibles
- `bun run build`: Compila la aplicación con Remix y Vite.
- `bun run start`: Inicia el servidor de producción con `remix-serve` en el puerto 3000.
- `bun run generate`: Genera nuevas migraciones SQL en `./drizzle` a partir del esquema Drizzle ORM.
- `bun run push`: Aplica cambios directamente del esquema a la base sin crear archivo de migración.
- `bun run studio`: Abre la interfaz gráfica web de Drizzle Studio para explorar las tablas.
- `bun test`: Ejecuta la suite de pruebas unitarias con Bun test.

---

## 📊 Comparativa de ventas: bovinos vs. semillas (integración con Semillas del Valle)

Ruta **`/reportes/comparativa`** (solo Administrador; menú *Administración → Comparativa de ventas*). Es la única vista que consume la API de **Semillas del Valle** (Django + JWT); el backend de este proyecto se alimenta de **dos fuentes**: su PostgreSQL (bovinos) y esa API (semillas).

**Qué muestra:** conclusión automática, 4 indicadores (ventas de cada lado, total combinado y peso de las semillas), gráfico de barras agrupadas / participación (%), tabla de detalle por periodo, composición por categoría, semillas más vendidas y reservas. Periodos: 8 semanas, 6 meses o 3 años (`?periodo=semana|mes|anio`). Incluye botón *Imprimir*.

**Configuración** (variables de entorno del servidor, ver `.env.example`): `SEMILLAS_API_URL`, `SEMILLAS_API_EMAIL`, `SEMILLAS_API_PASSWORD` (cuenta administradora de Semillas; use una dedicada). Opcionales: `SEMILLAS_API_TIMEOUT_MS`, `SEMILLAS_CACHE_TTL_SECONDS`, `SEMILLAS_API_ALLOW_HTTP`. En producción `remix-serve` no lee `.env`: exporte las variables.

**Cómo se calcula:** los intervalos los define Semillas y las ventas de bovinos (facturas «Completado», solo líneas de ejemplares) se agrupan en esos mismos intervalos con fecha de Bogotá (UTC-5).

**Seguridad:** credenciales y tokens solo en servidor; URL fija desde configuración (https obligatorio en producción); sin seguimiento de redirecciones; timeout y límite de tamaño; validación estricta de la respuesta; `periodo` por lista blanca; errores sin datos sensibles; `Cache-Control: no-store`. Además: cabeceras de seguridad globales, corrección de *open redirect* en el login y `SESSION_SECRET` obligatorio en producción.

**Código:** `app/services/semillas.server.ts` (cliente), `comparativa.ts` (lógica pura), `comparativa.server.ts` (BD + orquestación), `app/routes/reportes.comparativa.tsx` y `app/components/comparativa/`. Pruebas: `bun test` (`app/tests/`). Tras actualizar, ejecute `bun install` para registrar `@types/bun`.
