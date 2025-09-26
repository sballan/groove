import { useState, useEffect } from "preact/hooks";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    timezone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    // Auto-detect timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (userTimezone && timezones.includes(userTimezone)) {
      setFormData(prev => ({ ...prev, timezone: userTimezone }));
    }
  }, []);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Force a page reload to handle the cookie and redirect
        globalThis.location.href = "/dashboard";
      } else {
        setError(data.error || "Registration failed");
        setLoading(false);
      }
    } catch (_err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div class="mb-6">
        <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onInput={(e) => updateField("name", (e.target as HTMLInputElement).value)}
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="John Doe"
          disabled={loading}
        />
      </div>

      <div class="mb-6">
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onInput={(e) => updateField("email", (e.target as HTMLInputElement).value)}
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="you@example.com"
          disabled={loading}
        />
      </div>

      <div class="mb-6">
        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onInput={(e) => updateField("password", (e.target as HTMLInputElement).value)}
          required
          minLength={6}
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="••••••••"
          disabled={loading}
        />
        <p class="mt-1 text-sm text-gray-500">At least 6 characters</p>
      </div>

      <div class="mb-6">
        <label for="timezone" class="block text-sm font-medium text-gray-700 mb-2">
          Timezone
        </label>
        <select
          id="timezone"
          value={formData.timezone}
          onChange={(e) => updateField("timezone", (e.target as HTMLSelectElement).value)}
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={loading}
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
        disabled={loading}
        class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}