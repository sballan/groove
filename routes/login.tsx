import { Handlers, PageProps } from "$fresh/server.ts";
import { getSessionIdFromCookie, getUserFromSession } from "../lib/auth.ts";

interface LoginPageData {
  error?: string;
}

export const handler: Handlers<LoginPageData> = {
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

    return ctx.render({});
  },
};

export default function LoginPage({ data }: PageProps<LoginPageData>) {
  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center px-4">
      <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p class="text-gray-600">Sign in to your Groove account</p>
        </div>

        {data?.error && (
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {data.error}
          </div>
        )}

        <form method="POST" action="/api/auth/login" id="loginForm">
          <div class="mb-6">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="you@example.com"
            />
          </div>

          <div class="mb-6">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out"
          >
            Sign In
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Don't have an account?{" "}
            <a href="/register" class="text-indigo-600 hover:text-indigo-500">
              Sign up
            </a>
          </p>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);

            try {
              const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: formData.get('email'),
                  password: formData.get('password'),
                }),
              });

              const data = await response.json();

              if (response.ok) {
                window.location.href = '/dashboard';
              } else {
                alert(data.error || 'Login failed');
              }
            } catch (error) {
              alert('An error occurred. Please try again.');
            }
          });
        `
      }} />
    </div>
  );
}