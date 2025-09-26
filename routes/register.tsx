import { Handlers, PageProps } from "$fresh/server.ts";
import { getSessionIdFromCookie, getUserFromSession } from "../lib/auth.ts";

interface RegisterPageData {
  error?: string;
}

export const handler: Handlers<RegisterPageData> = {
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

export default function RegisterPage({ data }: PageProps<RegisterPageData>) {
  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Asia/Singapore",
    "Australia/Sydney",
  ];

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center px-4">
      <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Join Groove</h1>
          <p class="text-gray-600">Create your account to start tracking habits</p>
        </div>

        {data?.error && (
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {data.error}
          </div>
        )}

        <form method="POST" action="/api/auth/register" id="registerForm">
          <div class="mb-6">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="John Doe"
            />
          </div>

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
              minLength={6}
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
            />
            <p class="mt-1 text-sm text-gray-500">At least 6 characters</p>
          </div>

          <div class="mb-6">
            <label for="timezone" class="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              id="timezone"
              name="timezone"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select your timezone</option>
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace("_", " ").replace("/", " / ")}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out"
          >
            Create Account
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Already have an account?{" "}
            <a href="/login" class="text-indigo-600 hover:text-indigo-500">
              Sign in
            </a>
          </p>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          // Auto-detect timezone
          const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const timezoneSelect = document.getElementById('timezone');
          if (timezoneSelect && userTimezone) {
            const option = Array.from(timezoneSelect.options).find(opt => opt.value === userTimezone);
            if (option) {
              timezoneSelect.value = userTimezone;
            }
          }

          document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);

            try {
              const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: formData.get('name'),
                  email: formData.get('email'),
                  password: formData.get('password'),
                  timezone: formData.get('timezone'),
                }),
              });

              const data = await response.json();

              if (response.ok) {
                window.location.href = '/dashboard';
              } else {
                alert(data.error || 'Registration failed');
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