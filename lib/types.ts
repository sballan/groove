export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  workHours?: WorkHours;
  timezone: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: "people" | "activities" | "responsibilities";
  frequency: {
    type: "daily" | "weekly" | "monthly" | "custom";
    interval: number;
    weekdays?: number[];
  };
  duration: number;
  priority: "low" | "medium" | "high";
  tags: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkHours {
  monday: { start: string; end: string } | null;
  tuesday: { start: string; end: string } | null;
  wednesday: { start: string; end: string } | null;
  thursday: { start: string; end: string } | null;
  friday: { start: string; end: string } | null;
  saturday: { start: string; end: string } | null;
  sunday: { start: string; end: string } | null;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  completedAt: Date;
  scheduledFor: Date;
  notes?: string;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
}

export type HabitCategory = Habit["category"];
export type HabitPriority = Habit["priority"];
export type FrequencyType = Habit["frequency"]["type"];