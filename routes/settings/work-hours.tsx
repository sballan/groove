import { Handlers, PageProps } from "$fresh/server.ts";
import { db } from "../../lib/db.ts";
import type { User, WorkHours } from "../../lib/types.ts";

interface WorkHoursPageData {
  user: User;
}

export const handler: Handlers<WorkHoursPageData> = {
  async GET(_req, ctx) {
    const user = ctx.state.user as User;
    return ctx.render({ user });
  },
};

export default function WorkHoursPage({ data }: PageProps<WorkHoursPageData>) {
  const { user } = data;

  const days = [
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
  ];

  const dayLabels = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday"
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
              <a href="/habits" class="text-gray-500 hover:text-gray-700">
                Habits
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Work Hours Configuration</h2>
          <p class="text-gray-600 mb-6">
            Set your typical work hours so Groove can schedule habits around them.
          </p>

          <form id="workHoursForm">
            <div class="space-y-4">
              {days.map((day) => {
                const workDay = user.workHours?.[day as keyof WorkHours];
                const isEnabled = workDay !== null && workDay !== undefined;

                return (
                  <div key={day} class="border rounded-lg p-4">
                    <div class="flex items-center justify-between mb-3">
                      <label class="flex items-center">
                        <input
                          type="checkbox"
                          name={`${day}_enabled`}
                          checked={isEnabled}
                          onChange={`toggleDay('${day}')`}
                          class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span class="ml-2 text-lg font-medium text-gray-700">
                          {dayLabels[day as keyof typeof dayLabels]}
                        </span>
                      </label>
                    </div>

                    <div id={`${day}_times`} class={`grid grid-cols-2 gap-4 ${!isEnabled ? 'hidden' : ''}`}>
                      <div>
                        <label for={`${day}_start`} class="block text-sm text-gray-600 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          id={`${day}_start`}
                          name={`${day}_start`}
                          value={workDay?.start || "09:00"}
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label for={`${day}_end`} class="block text-sm text-gray-600 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          id={`${day}_end`}
                          name={`${day}_end`}
                          value={workDay?.end || "17:00"}
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div class="mt-6 flex space-x-4">
              <button
                type="button"
                onClick="setTypicalWorkWeek()"
                class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Set Typical 9-5 (Mon-Fri)
              </button>
              <button
                type="button"
                onClick="clearAll()"
                class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Clear All
              </button>
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
                Save Work Hours
              </button>
            </div>
          </form>
        </div>

        <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-blue-800 text-sm">
            <strong>💡 Tip:</strong> Groove will automatically schedule your habits outside of your work hours,
            ensuring you have time for what matters most without disrupting your workday.
          </p>
        </div>
      </main>

      <script dangerouslySetInnerHTML={{
        __html: `
          function toggleDay(day) {
            const checkbox = document.querySelector(\`input[name="\${day}_enabled"]\`);
            const timesDiv = document.getElementById(\`\${day}_times\`);

            if (checkbox.checked) {
              timesDiv.classList.remove('hidden');
            } else {
              timesDiv.classList.add('hidden');
            }
          }

          function setTypicalWorkWeek() {
            const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
            const weekends = ['saturday', 'sunday'];

            weekdays.forEach(day => {
              document.querySelector(\`input[name="\${day}_enabled"]\`).checked = true;
              document.getElementById(\`\${day}_times\`).classList.remove('hidden');
              document.getElementById(\`\${day}_start\`).value = '09:00';
              document.getElementById(\`\${day}_end\`).value = '17:00';
            });

            weekends.forEach(day => {
              document.querySelector(\`input[name="\${day}_enabled"]\`).checked = false;
              document.getElementById(\`\${day}_times\`).classList.add('hidden');
            });
          }

          function clearAll() {
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

            days.forEach(day => {
              document.querySelector(\`input[name="\${day}_enabled"]\`).checked = false;
              document.getElementById(\`\${day}_times\`).classList.add('hidden');
            });
          }

          document.getElementById('workHoursForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);

            const workHours = {};
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

            days.forEach(day => {
              if (formData.get(\`\${day}_enabled\`) === 'on') {
                workHours[day] = {
                  start: formData.get(\`\${day}_start\`),
                  end: formData.get(\`\${day}_end\`)
                };
              } else {
                workHours[day] = null;
              }
            });

            try {
              const response = await fetch('/api/work-hours/${user.id}', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workHours }),
              });

              if (response.ok) {
                alert('Work hours saved successfully!');
                window.location.href = '/dashboard';
              } else {
                alert('Failed to save work hours. Please try again.');
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