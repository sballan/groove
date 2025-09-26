import { assertEquals, assertExists, assertRejects } from "$std/assert/mod.ts";
import { afterAll, beforeAll, beforeEach, describe, it } from "$std/testing/bdd.ts";
import type { Habit, User } from "./types.ts";

// Create a test database instance
let testKv: Deno.Kv;

describe("Database Operations", () => {
  beforeAll(async () => {
    testKv = await Deno.openKv(":memory:");
  });

  afterAll(async () => {
    testKv.close();
  });

  beforeEach(async () => {
    // Clear test data before each test
    const iter = testKv.list({ prefix: [] });
    for await (const entry of iter) {
      await testKv.delete(entry.key);
    }
  });

  describe("Users", () => {
    const testUser = {
      email: "test@example.com",
      name: "Test User",
      timezone: "America/New_York",
    };

    it("should create and retrieve a user", async () => {
      const id = crypto.randomUUID();
      const now = new Date();
      const user: User = {
        ...testUser,
        id,
        createdAt: now,
        updatedAt: now,
      };

      await testKv.set(["users", id], user);
      const result = await testKv.get<User>(["users", id]);

      assertEquals(result.value?.id, id);
      assertEquals(result.value?.email, testUser.email);
    });

    it("should handle user not found", async () => {
      const result = await testKv.get<User>(["users", "non-existent"]);
      assertEquals(result.value, null);
    });
  });

  describe("Habits", () => {
    let testUserId: string;

    beforeEach(async () => {
      testUserId = crypto.randomUUID();
      const user: User = {
        id: testUserId,
        email: "test@example.com",
        name: "Test User",
        timezone: "America/New_York",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await testKv.set(["users", testUserId], user);
    });

    it("should create and retrieve a habit", async () => {
      const habitId = crypto.randomUUID();
      const now = new Date();
      const habit: Habit = {
        id: habitId,
        userId: testUserId,
        name: "Daily Exercise",
        description: "30 minutes of cardio",
        category: "activities",
        frequency: {
          type: "daily",
          interval: 1,
        },
        duration: 30,
        priority: "high",
        tags: ["health", "fitness"],
        active: true,
        createdAt: now,
        updatedAt: now,
      };

      await testKv.set(["habits", habitId], habit);
      const result = await testKv.get<Habit>(["habits", habitId]);

      assertEquals(result.value?.id, habitId);
      assertEquals(result.value?.name, "Daily Exercise");
      assertEquals(result.value?.userId, testUserId);
    });

    it("should list habits by user", async () => {
      const habit1: Habit = {
        id: crypto.randomUUID(),
        userId: testUserId,
        name: "Exercise",
        category: "activities",
        frequency: { type: "daily", interval: 1 },
        duration: 30,
        priority: "high",
        tags: [],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const habit2: Habit = {
        id: crypto.randomUUID(),
        userId: testUserId,
        name: "Reading",
        category: "activities",
        frequency: { type: "daily", interval: 1 },
        duration: 60,
        priority: "medium",
        tags: [],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await testKv.set(["habits_by_user", testUserId, habit1.id], habit1);
      await testKv.set(["habits_by_user", testUserId, habit2.id], habit2);

      const iter = testKv.list<Habit>({ prefix: ["habits_by_user", testUserId] });
      const habits: Habit[] = [];
      for await (const entry of iter) {
        habits.push(entry.value);
      }

      assertEquals(habits.length, 2);
      assertEquals(habits.some(h => h.name === "Exercise"), true);
      assertEquals(habits.some(h => h.name === "Reading"), true);
    });
  });

  describe("Atomic Operations", () => {
    it("should perform atomic transactions", async () => {
      const key1 = ["test", "key1"];
      const key2 = ["test", "key2"];

      const result = await testKv.atomic()
        .set(key1, "value1")
        .set(key2, "value2")
        .commit();

      assertEquals(result.ok, true);

      const result1 = await testKv.get(key1);
      const result2 = await testKv.get(key2);

      assertEquals(result1.value, "value1");
      assertEquals(result2.value, "value2");
    });

    it("should fail atomic transaction on conflict", async () => {
      const key = ["test", "conflict"];

      // Set initial value
      await testKv.set(key, "initial");
      const initial = await testKv.get(key);

      // Try to update with wrong versionstamp (simulating conflict)
      const result = await testKv.atomic()
        .check({ key, versionstamp: null }) // This should fail since key exists
        .set(key, "updated")
        .commit();

      assertEquals(result.ok, false);
    });
  });
});