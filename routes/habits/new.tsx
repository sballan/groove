import { Handlers, PageProps } from "$fresh/server.ts";
import type { User } from "../../lib/types.ts";

interface NewHabitPageData {
  user: User;
}

export const handler: Handlers<NewHabitPageData> = {
  GET(_req, ctx) {
    const user = ctx.state.user as User;
    return ctx.render({ user });
  },
};

export default function NewHabitPage({ data }: PageProps<NewHabitPageData>) {
  const { user } = data;

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
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Create New Habit</h2>

          <form id="habitForm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                  Habit Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  maxLength={100}
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Morning meditation"
                />
              </div>

              <div class="md:col-span-2">
                <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  maxLength={500}
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Optional details about this habit"
                />
              </div>

              <div>
                <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select category</option>
                  <option value="people">👥 People</option>
                  <option value="activities">🎯 Activities</option>
                  <option value="responsibilities">📋 Responsibilities</option>
                </select>
              </div>

              <div>
                <label for="priority" class="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  id="priority"
                  name="priority"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label for="frequency_type" class="block text-sm font-medium text-gray-700 mb-2">
                  Frequency Type *
                </label>
                <select
                  id="frequency_type"
                  name="frequency_type"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  onChange="toggleWeekdaysField(this.value)"
                >
                  <option value="">Select frequency</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label for="frequency_interval" class="block text-sm font-medium text-gray-700 mb-2">
                  Interval *
                </label>
                <input
                  type="number"
                  id="frequency_interval"
                  name="frequency_interval"
                  required
                  min="1"
                  value="1"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Every N days/weeks/months"
                />
                <p class="mt-1 text-sm text-gray-500">How often to repeat</p>
              </div>

              <div id="weekdaysField" class="md:col-span-2 hidden">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Weekdays (for weekly habits)
                </label>
                <div class="flex flex-wrap gap-3">
                  {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                    (day, index) => (
                      <label key={day} class="flex items-center">
                        <input
                          type="checkbox"
                          name="weekdays"
                          value={index}
                          class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span class="ml-2 text-sm text-gray-700">{day.slice(0, 3)}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              <div>
                <label for="duration" class="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  required
                  min="1"
                  max="1440"
                  value="30"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Time in minutes"
                />
              </div>

              <div>
                <label for="tags" class="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="health, fitness, work (comma separated)"
                />
              </div>

              <div class="md:col-span-2">
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    checked
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700">Active (habit is currently enabled)</span>
                </label>
              </div>
            </div>

            <div class="mt-8 flex justify-end space-x-4">
              <a
                href="/dashboard"
                class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </a>
              <button
                type="submit"
                class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Create Habit
              </button>
            </div>
          </form>
        </div>
      </main>

      <script dangerouslySetInnerHTML={{
        __html: `
          function toggleWeekdaysField(value) {
            const field = document.getElementById('weekdaysField');
            if (value === 'weekly') {
              field.classList.remove('hidden');
            } else {
              field.classList.add('hidden');
            }
          }

          document.getElementById('habitForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);

            const weekdays = [];
            formData.getAll('weekdays').forEach(day => {
              weekdays.push(parseInt(day));
            });

            const tags = formData.get('tags')
              ? formData.get('tags').split(',').map(tag => tag.trim()).filter(Boolean)
              : [];

            const habitData = {
              userId: '${user.id}',
              name: formData.get('name'),
              description: formData.get('description') || undefined,
              category: formData.get('category'),
              priority: formData.get('priority'),
              frequency: {
                type: formData.get('frequency_type'),
                interval: parseInt(formData.get('frequency_interval')),
                weekdays: weekdays.length > 0 ? weekdays : undefined,
              },
              duration: parseInt(formData.get('duration')),
              tags: tags,
              active: formData.get('active') === 'on',
            };

            try {
              const response = await fetch('/api/habits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(habitData),
              });

              const data = await response.json();

              if (response.ok) {
                alert('Habit created successfully!');
                window.location.href = '/dashboard';
              } else {
                alert('Error: ' + (data.error || 'Failed to create habit'));
              }
            } catch (error) {
              alert('An error occurred. Please try again.');
              console.error('Error:', error);
            }
          });
        `
      }} />
    </div>
  );
}