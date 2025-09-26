import { Handlers, PageProps } from "$fresh/server.ts";
import { db } from "../lib/db.ts";
import type { User, Habit } from "../lib/types.ts";

interface DashboardData {
  user: User;
  habits: Habit[];
  stats: {
    total: number;
    byCategory: {
      people: number;
      activities: number;
      responsibilities: number;
    };
    active: number;
  };
}

export const handler: Handlers<DashboardData> = {
  async GET(_req, ctx) {
    const user = ctx.state.user as User;
    const habits = await db.habits.getByUserId(user.id);

    const stats = {
      total: habits.length,
      byCategory: {
        people: habits.filter(h => h.category === "people").length,
        activities: habits.filter(h => h.category === "activities").length,
        responsibilities: habits.filter(h => h.category === "responsibilities").length,
      },
      active: habits.filter(h => h.active).length,
    };

    return ctx.render({ user, habits, stats });
  },
};

export default function Dashboard({ data }: PageProps<DashboardData>) {
  const { user, habits, stats } = data;

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-gray-800">🎵 Groove</h1>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-gray-700">Hi, {user.name}!</span>
              <a
                href="/habits/new"
                class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                + New Habit
              </a>
              <button
                id="logoutBtn"
                class="text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-gray-800 mb-4">Your Dashboard</h2>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
              <div class="text-3xl font-bold text-indigo-600 mb-2">{stats.total}</div>
              <div class="text-gray-600">Total Habits</div>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
              <div class="text-3xl font-bold text-green-600 mb-2">{stats.active}</div>
              <div class="text-gray-600">Active Habits</div>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-lg font-semibold">👥 {stats.byCategory.people}</div>
                  <div class="text-sm text-gray-600">People</div>
                </div>
                <div>
                  <div class="text-lg font-semibold">🎯 {stats.byCategory.activities}</div>
                  <div class="text-sm text-gray-600">Activities</div>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
              <div class="text-lg font-semibold">📋 {stats.byCategory.responsibilities}</div>
              <div class="text-gray-600">Responsibilities</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b">
            <h3 class="text-xl font-semibold text-gray-800">Your Habits</h3>
          </div>

          {habits.length === 0 ? (
            <div class="px-6 py-12 text-center">
              <p class="text-gray-500 mb-4">You haven't created any habits yet.</p>
              <a
                href="/habits/new"
                class="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
              >
                Create Your First Habit
              </a>
            </div>
          ) : (
            <div class="divide-y">
              {habits.map((habit) => (
                <div key={habit.id} class="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div class="flex-1">
                    <div class="flex items-center">
                      <span class="text-2xl mr-3">
                        {habit.category === "people" ? "👥" : habit.category === "activities" ? "🎯" : "📋"}
                      </span>
                      <div>
                        <h4 class="text-lg font-medium text-gray-900">{habit.name}</h4>
                        <p class="text-sm text-gray-600">
                          {habit.frequency.type} · {habit.duration} min · {habit.priority} priority
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class={`px-2 py-1 text-xs rounded-full ${
                      habit.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {habit.active ? "Active" : "Inactive"}
                    </span>
                    <a
                      href={`/habits/${habit.id}/edit`}
                      class="text-indigo-600 hover:text-indigo-800"
                    >
                      Edit
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div class="mt-8 flex justify-center space-x-4">
          <a
            href="/habits"
            class="bg-white text-indigo-600 px-6 py-2 rounded-md border border-indigo-600 hover:bg-indigo-50"
          >
            Manage All Habits
          </a>
          <a
            href="/settings/work-hours"
            class="bg-white text-indigo-600 px-6 py-2 rounded-md border border-indigo-600 hover:bg-indigo-50"
          >
            Set Work Hours
          </a>
          <a
            href="/calendar"
            class="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            View Calendar
          </a>
        </div>
      </main>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('logoutBtn').addEventListener('click', async () => {
            try {
              const response = await fetch('/api/auth/logout', { method: 'POST' });
              if (response.ok) {
                window.location.href = '/';
              }
            } catch (error) {
              console.error('Logout failed:', error);
            }
          });
        `
      }} />
    </div>
  );
}