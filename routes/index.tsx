export default function Home() {
  return (
    <div class="px-4 py-8 mx-auto bg-gradient-to-br from-purple-50 to-indigo-100 min-h-screen">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <div class="text-center mb-8">
          <h1 class="text-6xl font-bold text-gray-800 mb-4">🎵 Groove</h1>
          <p class="text-xl text-gray-600 mb-8">
            Find your rhythm. Track your habits. Live in harmony.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-6 w-full max-w-4xl">
          <div class="bg-white rounded-lg shadow-lg p-6 text-center">
            <div class="text-4xl mb-4">👥</div>
            <h3 class="text-lg font-semibold mb-2">People</h3>
            <p class="text-gray-600">Track time with the people who matter most</p>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6 text-center">
            <div class="text-4xl mb-4">🎯</div>
            <h3 class="text-lg font-semibold mb-2">Activities</h3>
            <p class="text-gray-600">Make time for what brings you fulfillment</p>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6 text-center">
            <div class="text-4xl mb-4">📋</div>
            <h3 class="text-lg font-semibold mb-2">Responsibilities</h3>
            <p class="text-gray-600">Stay on top of your obligations</p>
          </div>
        </div>

        <div class="mt-12 text-center">
          <p class="text-gray-600 mb-4">Smart Calendar Integration</p>
          <div class="text-sm text-gray-500 mb-8">
            Generate personalized schedules that respect your work hours
          </div>

          <div class="flex justify-center space-x-4">
            <a
              href="/register"
              class="bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-700 transition duration-150 ease-in-out"
            >
              Get Started
            </a>
            <a
              href="/login"
              class="bg-white text-indigo-600 px-8 py-3 rounded-md border border-indigo-600 hover:bg-indigo-50 transition duration-150 ease-in-out"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
