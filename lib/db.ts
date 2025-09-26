import type { Habit, HabitCompletion, Session, User } from "./types.ts";

const kv = await Deno.openKv();

export const db = {
  kv,

  users: {
    async create(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
      const id = crypto.randomUUID();
      const now = new Date();
      const newUser: User = {
        ...user,
        id,
        createdAt: now,
        updatedAt: now,
      };

      const key = ["users", id];
      const emailKey = ["users_by_email", user.email];

      const result = await kv.atomic()
        .check({ key, versionstamp: null })
        .check({ key: emailKey, versionstamp: null })
        .set(key, newUser)
        .set(emailKey, id)
        .commit();

      if (!result.ok) {
        throw new Error("User with this email already exists");
      }

      return newUser;
    },

    async getById(id: string): Promise<User | null> {
      const result = await kv.get<User>(["users", id]);
      return result.value;
    },

    async getByEmail(email: string): Promise<User | null> {
      const idResult = await kv.get<string>(["users_by_email", email]);
      if (!idResult.value) return null;

      return await this.getById(idResult.value);
    },

    async update(id: string, updates: Partial<Omit<User, "id" | "createdAt">>): Promise<User | null> {
      const existing = await this.getById(id);
      if (!existing) return null;

      const updated: User = {
        ...existing,
        ...updates,
        updatedAt: new Date(),
      };

      await kv.set(["users", id], updated);
      return updated;
    },

    async delete(id: string): Promise<boolean> {
      const user = await this.getById(id);
      if (!user) return false;

      const result = await kv.atomic()
        .delete(["users", id])
        .delete(["users_by_email", user.email])
        .commit();

      return result.ok;
    },
  },

  habits: {
    async create(habit: Omit<Habit, "id" | "createdAt" | "updatedAt">): Promise<Habit> {
      const id = crypto.randomUUID();
      const now = new Date();
      const newHabit: Habit = {
        ...habit,
        id,
        createdAt: now,
        updatedAt: now,
      };

      const key = ["habits", id];
      const userKey = ["habits_by_user", habit.userId, id];

      const result = await kv.atomic()
        .set(key, newHabit)
        .set(userKey, newHabit)
        .commit();

      if (!result.ok) {
        throw new Error("Failed to create habit");
      }

      return newHabit;
    },

    async getById(id: string): Promise<Habit | null> {
      const result = await kv.get<Habit>(["habits", id]);
      return result.value;
    },

    async getByUserId(userId: string): Promise<Habit[]> {
      const iter = kv.list<Habit>({ prefix: ["habits_by_user", userId] });
      const habits: Habit[] = [];

      for await (const entry of iter) {
        habits.push(entry.value);
      }

      return habits.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    },

    async update(id: string, updates: Partial<Omit<Habit, "id" | "createdAt">>): Promise<Habit | null> {
      const existing = await this.getById(id);
      if (!existing) return null;

      const updated: Habit = {
        ...existing,
        ...updates,
        updatedAt: new Date(),
      };

      const key = ["habits", id];
      const userKey = ["habits_by_user", existing.userId, id];

      const result = await kv.atomic()
        .set(key, updated)
        .set(userKey, updated)
        .commit();

      return result.ok ? updated : null;
    },

    async delete(id: string): Promise<boolean> {
      const habit = await this.getById(id);
      if (!habit) return false;

      const result = await kv.atomic()
        .delete(["habits", id])
        .delete(["habits_by_user", habit.userId, id])
        .commit();

      return result.ok;
    },
  },

  sessions: {
    async create(userId: string, expiresInMs = 30 * 24 * 60 * 60 * 1000): Promise<Session> {
      const id = crypto.randomUUID();
      const now = new Date();
      const session: Session = {
        id,
        userId,
        createdAt: now,
        expiresAt: new Date(now.getTime() + expiresInMs),
      };

      await kv.set(["sessions", id], session, { expireIn: expiresInMs });
      return session;
    },

    async get(id: string): Promise<Session | null> {
      const result = await kv.get<Session>(["sessions", id]);
      if (!result.value) return null;

      if (result.value.expiresAt < new Date()) {
        await this.delete(id);
        return null;
      }

      return result.value;
    },

    async delete(id: string): Promise<boolean> {
      await kv.delete(["sessions", id]);
      return true;
    },
  },

  completions: {
    async create(completion: Omit<HabitCompletion, "id">): Promise<HabitCompletion> {
      const id = crypto.randomUUID();
      const newCompletion: HabitCompletion = {
        ...completion,
        id,
      };

      const key = ["completions", id];
      const habitKey = ["completions_by_habit", completion.habitId, id];
      const userKey = ["completions_by_user", completion.userId, id];

      const result = await kv.atomic()
        .set(key, newCompletion)
        .set(habitKey, newCompletion)
        .set(userKey, newCompletion)
        .commit();

      if (!result.ok) {
        throw new Error("Failed to create completion");
      }

      return newCompletion;
    },

    async getByHabitId(habitId: string): Promise<HabitCompletion[]> {
      const iter = kv.list<HabitCompletion>({ prefix: ["completions_by_habit", habitId] });
      const completions: HabitCompletion[] = [];

      for await (const entry of iter) {
        completions.push(entry.value);
      }

      return completions.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
    },

    async getByUserId(userId: string): Promise<HabitCompletion[]> {
      const iter = kv.list<HabitCompletion>({ prefix: ["completions_by_user", userId] });
      const completions: HabitCompletion[] = [];

      for await (const entry of iter) {
        completions.push(entry.value);
      }

      return completions.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
    },
  },
};

export async function closeDb() {
  await kv.close();
}