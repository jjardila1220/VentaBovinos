import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession, destroySession } from "~/services/session.server.ts";

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request);
  return redirect("/?info=Has+cerrado+sesión+exitosamente", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
