import type { Habit, User, WorkHours, HabitCompletion } from "./types.ts";

export interface ScheduledEvent {
  habitId: string;
  habitName: string;
  category: Habit["category"];
  priority: Habit["priority"];
  startTime: Date;
  endTime: Date;
  duration: number;
}

interface TimeSlot {
  start: Date;
  end: Date;
}

export class ScheduleGenerator {
  private user: User;
  private habits: Habit[];
  private completions: HabitCompletion[];
  private startDate: Date;
  private endDate: Date;

  constructor(
    user: User,
    habits: Habit[],
    completions: HabitCompletion[],
    startDate: Date,
    endDate: Date
  ) {
    this.user = user;
    this.habits = habits.filter(h => h.active);
    this.completions = completions;
    this.startDate = startDate;
    this.endDate = endDate;
  }

  generateSchedule(): ScheduledEvent[] {
    const events: ScheduledEvent[] = [];
    const currentDate = new Date(this.startDate);

    while (currentDate <= this.endDate) {
      const dayEvents = this.scheduleDayHabits(currentDate);
      events.push(...dayEvents);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return events;
  }

  private scheduleDayHabits(date: Date): ScheduledEvent[] {
    const dayEvents: ScheduledEvent[] = [];
    const availableSlots = this.getAvailableTimeSlots(date);
    const habitsForDay = this.getHabitsForDay(date);

    // Sort habits by priority (high to low)
    habitsForDay.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    for (const habit of habitsForDay) {
      const slot = this.findBestTimeSlot(availableSlots, habit, date);
      if (slot) {
        const event: ScheduledEvent = {
          habitId: habit.id,
          habitName: habit.name,
          category: habit.category,
          priority: habit.priority,
          startTime: slot.start,
          endTime: slot.end,
          duration: habit.duration,
        };
        dayEvents.push(event);

        // Remove the used time from available slots
        this.updateAvailableSlots(availableSlots, slot);
      }
    }

    return dayEvents;
  }

  private getAvailableTimeSlots(date: Date): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const dayOfWeek = date.getDay();
    const dayName = this.getDayName(dayOfWeek);

    const workHours = this.user.workHours?.[dayName as keyof WorkHours];

    if (!workHours) {
      // No work hours, entire day is available (6 AM to 10 PM)
      slots.push({
        start: this.createDateTime(date, "06:00"),
        end: this.createDateTime(date, "22:00"),
      });
    } else {
      // Add morning slot (6 AM to work start)
      const workStart = this.createDateTime(date, workHours.start);
      if (workStart.getHours() > 6) {
        slots.push({
          start: this.createDateTime(date, "06:00"),
          end: workStart,
        });
      }

      // Add evening slot (work end to 10 PM)
      const workEnd = this.createDateTime(date, workHours.end);
      if (workEnd.getHours() < 22) {
        slots.push({
          start: workEnd,
          end: this.createDateTime(date, "22:00"),
        });
      }

      // Add lunch break if work hours span lunch time
      const lunchStart = this.createDateTime(date, "12:00");
      const lunchEnd = this.createDateTime(date, "13:00");
      if (workStart <= lunchStart && workEnd >= lunchEnd) {
        slots.push({
          start: lunchStart,
          end: lunchEnd,
        });
      }
    }

    return slots;
  }

  private getHabitsForDay(date: Date): Habit[] {
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();

    return this.habits.filter(habit => {
      switch (habit.frequency.type) {
        case "daily":
          // Check if it's time based on interval
          const daysSinceStart = Math.floor(
            (date.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          return daysSinceStart % habit.frequency.interval === 0;

        case "weekly":
          // Check if today is one of the scheduled weekdays
          if (habit.frequency.weekdays && habit.frequency.weekdays.includes(dayOfWeek)) {
            // Check weekly interval
            const weeksSinceStart = Math.floor(
              (date.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
            );
            return weeksSinceStart % habit.frequency.interval === 0;
          }
          return false;

        case "monthly":
          // Schedule on the same day of each month (or last day if month is shorter)
          const targetDay = Math.min(dayOfMonth, this.getDaysInMonth(date));
          if (dayOfMonth === targetDay) {
            const monthsSinceStart =
              (date.getFullYear() - this.startDate.getFullYear()) * 12 +
              (date.getMonth() - this.startDate.getMonth());
            return monthsSinceStart % habit.frequency.interval === 0;
          }
          return false;

        case "custom":
          // For custom, just use the interval as days
          const customDaysSinceStart = Math.floor(
            (date.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          return customDaysSinceStart % habit.frequency.interval === 0;

        default:
          return false;
      }
    });
  }

  private findBestTimeSlot(slots: TimeSlot[], habit: Habit, date: Date): TimeSlot | null {
    const requiredMinutes = habit.duration;

    // Prefer certain times based on category
    const preferredTimes = this.getPreferredTimes(habit.category);

    for (const preferred of preferredTimes) {
      const preferredStart = this.createDateTime(date, preferred);

      for (const slot of slots) {
        if (slot.start <= preferredStart && slot.end >= preferredStart) {
          const proposedEnd = new Date(preferredStart.getTime() + requiredMinutes * 60 * 1000);

          if (proposedEnd <= slot.end) {
            return {
              start: preferredStart,
              end: proposedEnd,
            };
          }
        }
      }
    }

    // If no preferred time works, find any available slot
    for (const slot of slots) {
      const slotDuration = (slot.end.getTime() - slot.start.getTime()) / (1000 * 60);
      if (slotDuration >= requiredMinutes) {
        return {
          start: slot.start,
          end: new Date(slot.start.getTime() + requiredMinutes * 60 * 1000),
        };
      }
    }

    return null;
  }

  private updateAvailableSlots(slots: TimeSlot[], usedSlot: TimeSlot): void {
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];

      if (usedSlot.start >= slot.start && usedSlot.end <= slot.end) {
        // Split the slot
        const newSlots: TimeSlot[] = [];

        // Add the part before the used slot
        if (usedSlot.start > slot.start) {
          newSlots.push({
            start: slot.start,
            end: usedSlot.start,
          });
        }

        // Add the part after the used slot
        if (usedSlot.end < slot.end) {
          newSlots.push({
            start: usedSlot.end,
            end: slot.end,
          });
        }

        // Replace the original slot with the new slots
        slots.splice(i, 1, ...newSlots);
        break;
      }
    }
  }

  private getPreferredTimes(category: Habit["category"]): string[] {
    switch (category) {
      case "activities":
        return ["07:00", "18:00", "19:00"]; // Morning or evening for activities
      case "people":
        return ["19:00", "20:00", "12:00"]; // Evening or lunch for social
      case "responsibilities":
        return ["09:00", "10:00", "14:00"]; // Morning or afternoon for tasks
      default:
        return ["09:00", "14:00", "19:00"];
    }
  }

  private createDateTime(date: Date, timeString: string): Date {
    const [hours, minutes] = timeString.split(":").map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  private getDayName(dayOfWeek: number): string {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[dayOfWeek];
  }

  private getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }
}