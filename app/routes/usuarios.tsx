import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, Link } from "@remix-run/react";
import { requireAdmin } from "~/services/auth.server.ts";
import { db } from "~/db/index.ts";
import { users } from "~/db/schema/users.ts";
import { eq, desc } from "drizzle-orm";
import { Users, Shield, UserCheck, UserX, ChevronRight, Sparkles } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);

  try {
    const userList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        active: users.active,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.id));

    return json({ users: userList });
  } catch (error) {
    console.error("Users loader error:", error);
    return json({ users: [] });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const currentAdmin = await requireAdmin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const targetUserId = Number(formData.get("userId"));

  if (!targetUserId) {
    return json({ error: "ID de usuario inválido" }, { status: 400 });
  }

  // Prevenir que el admin se desactive a sí mismo
  if (targetUserId === currentAdmin.id && intent === "toggleActive") {
    return json({ error: "No puedes desactivar tu propia cuenta administradora." }, { status: 400 });
  }

  if (intent === "updateRole") {
    const newRole = formData.get("role")?.toString() as any;
    if (["Cliente", "Administrador"].includes(newRole)) {
      await db.update(users).set({ role: newRole }).where(eq(users.id, targetUserId));
      return json({ success: true });
    }
  }

  if (intent === "toggleActive") {
    const [targetUser] = await db.select().from(users).where(eq(users.id, targetUserId));
    if (targetUser) {
      await db.update(users).set({ active: !targetUser.active }).where(eq(users.id, targetUserId));
      return json({ success: true });
    }
  }

  return json({ ok: true });
}

export default function Usuarios() {
  const { users: userList } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500 font-medium">
        <Link to="/" className="hover:text-[#B3202A]">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="text-stone-900 font-bold">Gestión de Usuarios</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#B3202A] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Módulo de Control de Acceso (RBAC)</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-[#B3202A]" />
            <span>Gestión de Usuarios</span>
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            Administra los roles del sistema (Cliente, Administrador) y el estado de activación de cuentas.
          </p>
        </div>

        <div className="text-xs font-semibold text-stone-500">
          Total: <span className="text-[#B3202A] font-bold text-sm">{userList.length}</span> cuentas registradas
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4 font-bold">ID</th>
                <th className="py-3.5 px-4 font-bold">Nombre Completo</th>
                <th className="py-3.5 px-4 font-bold">Correo Electrónico</th>
                <th className="py-3.5 px-4 font-bold">Rol Actual</th>
                <th className="py-3.5 px-4 font-bold text-center">Estado</th>
                <th className="py-3.5 px-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {userList.map((u) => (
                <tr key={u.id} className="hover:bg-rose-50/30 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-stone-400">
                    #{u.id}
                  </td>
                  <td className="py-4 px-4 font-bold text-stone-900">
                    {u.name}
                  </td>
                  <td className="py-4 px-4 text-stone-600 font-mono text-[11px]">
                    {u.email}
                  </td>
                  <td className="py-4 px-4">
                    <Form method="post" className="inline-block">
                      <input type="hidden" name="intent" value="updateRole" />
                      <input type="hidden" name="userId" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        onChange={(e) => e.target.form?.submit()}
                        className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1 text-xs text-stone-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#B3202A]"
                      >
                        <option value="Cliente">Cliente</option>
                        <option value="Administrador">Administrador</option>
                      </select>
                    </Form>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-stone-200 text-stone-600"
                      }`}
                    >
                      {u.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Form method="post" className="inline-block">
                      <input type="hidden" name="intent" value="toggleActive" />
                      <input type="hidden" name="userId" value={u.id} />
                      <button
                        type="submit"
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                          u.active
                            ? "bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-700"
                            : "bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                        }`}
                      >
                        {u.active ? "Desactivar" : "Activar"}
                      </button>
                    </Form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
