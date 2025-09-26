import { Handlers, PageProps } from "$fresh/server.ts";
import type { User } from "../lib/types.ts";

interface CalendarPageData {
  user: User;
  feedUrl: string;
}

export const handler: Handlers<CalendarPageData> = {
  GET(req, ctx) {
    const user = ctx.state.user as User;
    const feedUrl = `${req.url.origin}/api/calendar/feed/${user.id}.ics`;
    return ctx.render({ user, feedUrl });
  },
};

export default function CalendarPage({ data }: PageProps<CalendarPageData>) {
  const { user, feedUrl } = data;

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <a href="/dashboard" class="text-2xl font-bold text-gray-800">🎵 Groove</a>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-gray-700">Hi, {user.name}!</span>
              <a href="/dashboard" class="text-gray-500 hover:text-gray-700">
                Dashboard
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">📅 Calendar Integration</h2>

          <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-700 mb-3">Your Calendar Feed URL</h3>
            <div class="flex items-center space-x-2">
              <input
                type="text"
                value={feedUrl}
                readOnly
                class="flex-1 px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
              <button
                onclick={`navigator.clipboard.writeText('${feedUrl}'); alert('URL copied to clipboard!');`}
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Copy URL
              </button>
            </div>
            <p class="mt-2 text-sm text-gray-600">
              Use this URL to subscribe to your Groove habits in any calendar application.
            </p>
          </div>

          <div class="border-t pt-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">How to Subscribe</h3>

            <div class="space-y-6">
              <div>
                <h4 class="font-medium text-gray-700 mb-2">📱 Apple Calendar (iPhone/Mac)</h4>
                <ol class="list-decimal list-inside text-sm text-gray-600 space-y-1">
                  <li>Open Calendar app</li>
                  <li>Go to File → New Calendar Subscription (Mac) or Settings → Calendar → Accounts → Add Account (iPhone)</li>
                  <li>Paste the URL above</li>
                  <li>Choose a refresh frequency (we recommend hourly)</li>
                </ol>
              </div>

              <div>
                <h4 class="font-medium text-gray-700 mb-2">📧 Google Calendar</h4>
                <ol class="list-decimal list-inside text-sm text-gray-600 space-y-1">
                  <li>Open Google Calendar on a computer</li>
                  <li>Click the + next to "Other calendars"</li>
                  <li>Select "From URL"</li>
                  <li>Paste the URL above</li>
                  <li>Click "Add calendar"</li>
                </ol>
              </div>

              <div>
                <h4 class="font-medium text-gray-700 mb-2">📅 Outlook</h4>
                <ol class="list-decimal list-inside text-sm text-gray-600 space-y-1">
                  <li>Open Outlook Calendar</li>
                  <li>Click "Add calendar" → "Subscribe from web"</li>
                  <li>Paste the URL above</li>
                  <li>Give it a name and click "Import"</li>
                </ol>
              </div>
            </div>
          </div>

          <div class="mt-8 flex space-x-4">
            <a
              href={feedUrl}
              download="groove-habits.ics"
              class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Download Calendar File
            </a>
            <button
              onclick={`window.open('webcal:${feedUrl.replace('http:', '').replace('https:', '')}', '_blank');`}
              class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Subscribe in Default App
            </button>
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 class="font-semibold text-blue-900 mb-2">💡 Tips</h4>
          <ul class="text-sm text-blue-800 space-y-1">
            <li>• Your calendar will automatically update when you add or modify habits</li>
            <li>• Events are scheduled around your work hours</li>
            <li>• High priority habits are scheduled first</li>
            <li>• The feed shows habits for the next 30 days</li>
          </ul>
        </div>
      </main>
    </div>
  );
}