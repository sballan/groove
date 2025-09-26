import { Handlers, PageProps } from "$fresh/server.ts";
import { db } from "../../lib/db.ts";
import type { User, Habit } from "../../lib/types.ts";

interface HabitsPageData {
  user: User;
  habits: Habit[];
}

export const handler: Handlers<HabitsPageData> = {
  async GET(_req, ctx) {
    const user = ctx.state.user as User;
    const habits = await db.habits.getByUserId(user.id);

    return ctx.render({ user, habits });
  },
};

export default function HabitsPage({ data }: PageProps<HabitsPageData>) {
  const { user, habits } = data;

  const categoryIcons = {
    people: "👥",
    activities: "🎯",
    responsibilities: "📋",
  };

  const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

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
              <a
                href="/habits/new"
                class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                + New Habit
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-gray-800 mb-4">Manage Your Habits</h2>
          <div class="flex space-x-4 mb-6">
            <button class="px-4 py-2 bg-white rounded-md shadow text-gray-700 hover:bg-gray-50">
              All ({habits.length})
            </button>
            <button class="px-4 py-2 bg-white rounded-md shadow text-gray-700 hover:bg-gray-50">
              Active ({habits.filter(h => h.active).length})
            </button>
            <button class="px-4 py-2 bg-white rounded-md shadow text-gray-700 hover:bg-gray-50">
              Inactive ({habits.filter(h => !h.active).length})
            </button>
          </div>
        </div>

        {habits.length === 0 ? (
          <div class="bg-white rounded-lg shadow p-12 text-center">
            <p class="text-gray-500 mb-4">You haven't created any habits yet.</p>
            <a
              href="/habits/new"
              class="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              Create Your First Habit
            </a>
          </div>
        ) : (
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {habits.map((habit) => (
              <div key={habit.id} class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center">
                    <span class="text-3xl mr-3">{categoryIcons[habit.category]}</span>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900">{habit.name}</h3>
                      <p class="text-sm text-gray-600">{habit.category}</p>
                    </div>
                  </div>
                  <span class={`px-2 py-1 text-xs rounded-full ${
                    habit.active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {habit.active ? "Active" : "Inactive"}
                  </span>
                </div>

                {habit.description && (
                  <p class="text-gray-600 text-sm mb-4">{habit.description}</p>
                )}

                <div class="space-y-2 mb-4">
                  <div class="flex items-center text-sm">
                    <span class="text-gray-500 w-20">Frequency:</span>
                    <span class="text-gray-700">
                      {habit.frequency.type}
                      {habit.frequency.interval > 1 && ` (every ${habit.frequency.interval})`}
                    </span>
                  </div>
                  <div class="flex items-center text-sm">
                    <span class="text-gray-500 w-20">Duration:</span>
                    <span class="text-gray-700">{habit.duration} minutes</span>
                  </div>
                  <div class="flex items-center text-sm">
                    <span class="text-gray-500 w-20">Priority:</span>
                    <span class={`px-2 py-1 text-xs rounded ${priorityColors[habit.priority]}`}>
                      {habit.priority}
                    </span>
                  </div>
                  {habit.tags.length > 0 && (
                    <div class="flex items-start text-sm">
                      <span class="text-gray-500 w-20">Tags:</span>
                      <div class="flex flex-wrap gap-1">
                        {habit.tags.map(tag => (
                          <span key={tag} class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div class="flex justify-between pt-4 border-t">
                  <a
                    href={`/habits/${habit.id}/edit`}
                    class="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Edit
                  </a>
                  <button
                    data-habit-id={habit.id}
                    data-habit-name={habit.name}
                    class="delete-btn text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
              const habitId = e.target.dataset.habitId;
              const habitName = e.target.dataset.habitName;

              if (!confirm(\`Are you sure you want to delete "\${habitName}"?\`)) {
                return;
              }

              try {
                const response = await fetch(\`/api/habits/\${habitId}\`, {
                  method: 'DELETE',
                });

                if (response.ok) {
                  window.location.reload();
                } else {
                  alert('Failed to delete habit. Please try again.');
                }
              } catch (error) {
                alert('An error occurred. Please try again.');
              }
            });
          });
        `
      }} />
    </div>
  );
}