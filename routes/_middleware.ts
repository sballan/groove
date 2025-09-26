import { FreshContext } from "$fresh/server.ts";
import { getSessionIdFromCookie, getUserFromSession } from "../lib/auth.ts";

export async function handler(req: Request, ctx: FreshContext) {
  const url = new URL(req.url);
  const protectedPaths = ["/dashboard", "/habits", "/settings"];
  const authPaths = ["/login", "/register"];

  const isProtected = protectedPaths.some(path => url.pathname.startsWith(path));
  const isAuthPath = authPaths.includes(url.pathname);

  if (isProtected || isAuthPath) {
    const cookieHeader = req.headers.get("cookie");
    const sessionId = getSessionIdFromCookie(cookieHeader);

    let user = null;
    if (sessionId) {
      user = await getUserFromSession(sessionId);
    }

    if (isProtected && !user) {
      return new Response("", {
        status: 303,
        headers: { Location: "/login" },
      });
    }

    ctx.state.user = user;
  }

  return ctx.next();
}