import { assertEquals, assertThrows } from "$std/assert/mod.ts";
import { describe, it } from "$std/testing/bdd.ts";
import {
  validateEmail,
  validateHabit,
  validateHabitCategory,
  validateHabitPriority,
  validateNumber,
  validateRequired,
  validateString,
  validateTimeString,
  validateUser,
  validateWeekdays,
  validateWorkHours,
  ValidationError,
} from "./validation.ts";

describe("Validation", () => {
  describe("validateEmail", () => {
    it("should accept valid email addresses", () => {
      validateEmail("test@example.com");
      validateEmail("user.name@domain.co.uk");
      validateEmail("test123+tag@example.org");
    });

    it("should reject invalid email addresses", () => {
      assertThrows(() => validateEmail(""), ValidationError, "Email is required");
      assertThrows(() => validateEmail("invalid-email"), ValidationError, "Invalid email format");
      assertThrows(() => validateEmail("@domain.com"), ValidationError, "Invalid email format");
      assertThrows(() => validateEmail("user@"), ValidationError, "Invalid email format");
    });
  });

  describe("validateRequired", () => {
    it("should accept non-empty values", () => {
      validateRequired("test", "field");
      validateRequired(0, "field");
      validateRequired(false, "field");
      validateRequired([], "field");
      validateRequired({}, "field");
    });

    it("should reject empty values", () => {
      assertThrows(() => validateRequired(undefined, "field"), ValidationError, "Field is required");
      assertThrows(() => validateRequired(null, "field"), ValidationError, "Field is required");
      assertThrows(() => validateRequired("", "field"), ValidationError, "Field is required");
    });
  });

  describe("validateString", () => {
    it("should accept valid strings", () => {
      validateString("test", "field");
      validateString("hello world", "field", 5, 20);
    });

    it("should reject invalid strings", () => {
      assertThrows(() => validateString("", "field"), ValidationError, "Field is required");
      assertThrows(() => validateString(123, "field"), ValidationError, "Must be a string");
      assertThrows(() => validateString("hi", "field", 5), ValidationError, "Must be at least 5 characters");
      assertThrows(() => validateString("too long text", "field", 0, 5), ValidationError, "Must be no more than 5 characters");
    });
  });

  describe("validateNumber", () => {
    it("should accept valid numbers", () => {
      validateNumber(42, "field");
      validateNumber(0, "field");
      validateNumber(-10, "field", -20, 100);
    });

    it("should reject invalid numbers", () => {
      assertThrows(() => validateNumber(undefined, "field"), ValidationError, "Field is required");
      assertThrows(() => validateNumber("123", "field"), ValidationError, "Must be a valid number");
      assertThrows(() => validateNumber(NaN, "field"), ValidationError, "Must be a valid number");
      assertThrows(() => validateNumber(5, "field", 10), ValidationError, "Must be at least 10");
      assertThrows(() => validateNumber(15, "field", 0, 10), ValidationError, "Must be no more than 10");
    });
  });

  describe("validateHabitCategory", () => {
    it("should accept valid categories", () => {
      validateHabitCategory("people");
      validateHabitCategory("activities");
      validateHabitCategory("responsibilities");
    });

    it("should reject invalid categories", () => {
      assertThrows(() => validateHabitCategory("invalid"), ValidationError, "Must be one of: people, activities, responsibilities");
      assertThrows(() => validateHabitCategory(""), ValidationError);
      assertThrows(() => validateHabitCategory(null), ValidationError);
    });
  });

  describe("validateHabitPriority", () => {
    it("should accept valid priorities", () => {
      validateHabitPriority("low");
      validateHabitPriority("medium");
      validateHabitPriority("high");
    });

    it("should reject invalid priorities", () => {
      assertThrows(() => validateHabitPriority("urgent"), ValidationError, "Must be one of: low, medium, high");
      assertThrows(() => validateHabitPriority(""), ValidationError);
    });
  });

  describe("validateWeekdays", () => {
    it("should accept valid weekday arrays", () => {
      validateWeekdays([0, 1, 2, 3, 4, 5, 6]);
      validateWeekdays([1, 3, 5]);
      validateWeekdays([]);
    });

    it("should reject invalid weekday arrays", () => {
      assertThrows(() => validateWeekdays("not array"), ValidationError, "Must be an array");
      assertThrows(() => validateWeekdays([7]), ValidationError, "Weekdays must be numbers between 0-6");
      assertThrows(() => validateWeekdays([-1]), ValidationError, "Weekdays must be numbers between 0-6");
      assertThrows(() => validateWeekdays(["Monday"]), ValidationError, "Weekdays must be numbers between 0-6");
    });
  });

  describe("validateTimeString", () => {
    it("should accept valid time strings", () => {
      validateTimeString("09:00", "field");
      validateTimeString("23:59", "field");
      validateTimeString("00:00", "field");
      validateTimeString("12:30", "field");
    });

    it("should reject invalid time strings", () => {
      assertThrows(() => validateTimeString(900, "field"), ValidationError, "Must be a string");
      assertThrows(() => validateTimeString("9:00", "field"), ValidationError, "Must be in HH:MM format");
      assertThrows(() => validateTimeString("24:00", "field"), ValidationError, "Must be in HH:MM format");
      assertThrows(() => validateTimeString("12:60", "field"), ValidationError, "Must be in HH:MM format");
      assertThrows(() => validateTimeString("invalid", "field"), ValidationError, "Must be in HH:MM format");
    });
  });

  describe("validateWorkHours", () => {
    it("should accept valid work hours", () => {
      validateWorkHours({
        monday: { start: "09:00", end: "17:00" },
        tuesday: { start: "09:00", end: "17:00" },
        wednesday: null,
        thursday: { start: "10:00", end: "18:00" },
        friday: { start: "09:00", end: "17:00" },
        saturday: null,
        sunday: null,
      });
    });

    it("should reject invalid work hours", () => {
      assertThrows(() => validateWorkHours("not object"), ValidationError, "Work hours must be an object");

      assertThrows(() => validateWorkHours({
        monday: { start: "17:00", end: "09:00" },
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
        sunday: null,
      }), ValidationError, "Start time must be before end time");

      assertThrows(() => validateWorkHours({
        monday: { start: "invalid", end: "17:00" },
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
        sunday: null,
      }), ValidationError, "Must be in HH:MM format");
    });
  });

  describe("validateUser", () => {
    const validUser = {
      email: "test@example.com",
      name: "Test User",
      timezone: "America/New_York",
    };

    it("should accept valid user data", () => {
      validateUser(validUser);
      validateUser({
        ...validUser,
        workHours: {
          monday: { start: "09:00", end: "17:00" },
          tuesday: { start: "09:00", end: "17:00" },
          wednesday: null,
          thursday: null,
          friday: null,
          saturday: null,
          sunday: null,
        },
      });
    });

    it("should reject invalid user data", () => {
      assertThrows(() => validateUser(null), ValidationError, "User data must be an object");
      assertThrows(() => validateUser({ ...validUser, email: "invalid" }), ValidationError, "Invalid email format");
      assertThrows(() => validateUser({ ...validUser, name: "" }), ValidationError, "Field is required");
      assertThrows(() => validateUser({ ...validUser, timezone: "" }), ValidationError, "Field is required");
    });
  });

  describe("validateHabit", () => {
    const validHabit = {
      userId: "user-123",
      name: "Daily Exercise",
      description: "30 minutes of cardio",
      category: "activities" as const,
      frequency: {
        type: "daily" as const,
        interval: 1,
      },
      duration: 30,
      priority: "high" as const,
      tags: ["health", "fitness"],
      active: true,
    };

    it("should accept valid habit data", () => {
      validateHabit(validHabit);
      validateHabit({
        ...validHabit,
        frequency: {
          type: "weekly",
          interval: 2,
          weekdays: [1, 3, 5],
        },
      });
    });

    it("should reject invalid habit data", () => {
      assertThrows(() => validateHabit(null), ValidationError, "Habit data must be an object");
      assertThrows(() => validateHabit({ ...validHabit, name: "" }), ValidationError, "Field is required");
      assertThrows(() => validateHabit({ ...validHabit, category: "invalid" }), ValidationError, "Must be one of: people, activities, responsibilities");
      assertThrows(() => validateHabit({ ...validHabit, duration: 0 }), ValidationError, "Must be at least 1");
      assertThrows(() => validateHabit({ ...validHabit, tags: ["valid", 123] }), ValidationError, "All tags must be strings");
      assertThrows(() => validateHabit({ ...validHabit, active: "true" }), ValidationError, "Active must be a boolean");
    });
  });
});