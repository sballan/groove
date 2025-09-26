import { Handlers } from "$fresh/server.ts";
import { getSessionIdFromCookie, getUserFromSession } from "../lib/auth.ts";
import LoginForm from "../islands/LoginForm.tsx";

export const handler: Handlers = {
  async GET(req, ctx) {
    const cookieHeader = req.headers.get("cookie");
    const sessionId = getSessionIdFromCookie(cookieHeader);

    if (sessionId) {
      const user = await getUserFromSession(sessionId);
      if (user) {
        return new Response("", {
          status: 303,
          headers: { Location: "/dashboard" },
        });
      }
    }

    return ctx.render();
  },
};

export default function LoginPage() {
  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center px-4">
      <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p class="text-gray-600">Sign in to your Groove account</p>
        </div>

        <LoginForm />

        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Don't have an account?{" "}
            <a href="/register" class="text-indigo-600 hover:text-indigo-500">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}