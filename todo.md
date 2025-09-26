# Groove - Habit Tracker & Calendar Integration

## Project Overview

Groove is a habit tracking app that helps users maintain consistent engagement
with three key areas of life:

1. **People** - Important relationships to nurture
2. **Activities** - Fulfilling pursuits and hobbies
3. **Responsibilities** - Obligations and necessary tasks

The app generates calendar feeds that intelligently schedule these habits while
respecting work hours and existing commitments.

## Technical Stack

- **Framework**: Deno Fresh 1.7.3
- **Runtime**: Deno 2.5.2
- **Frontend**: Preact with Tailwind CSS
- **Database**: Deno KV (built-in key-value store)
- **Calendar**: iCal/ICS format generation
- **Authentication**: Deno KV sessions

## Implementation Plan

### General Strategy

- Test everything we can. Use the built in deno test runner when possible
- Testing of routes, handlers, should follow best practices for the Fresh
  framework. See https://fresh.deno.dev/docs/testing

### Phase 1: Core Data Models & Database Setup

- [ ] Set up Deno KV database schemas
- [ ] Create habit types (People, Activities, Responsibilities)
- [ ] Implement habit CRUD operations
- [ ] Add user management and authentication
- [ ] Create basic data validation

### Phase 2: Habit Management Interface

- [ ] Build habit creation forms for each category
- [ ] Implement habit listing and editing pages
- [ ] Add habit deletion with confirmation
- [ ] Create habit frequency configuration (daily, weekly, monthly, custom)
- [ ] Add habit priority levels and tags

### Phase 3: Schedule Generation Engine

- [ ] Build core scheduling algorithm
- [ ] Implement work hours configuration
- [ ] Create conflict detection for existing events
- [ ] Add intelligent spacing between similar habits
- [ ] Implement priority-based scheduling
- [ ] Add duration estimation for each habit

### Phase 4: Calendar Integration

- [ ] Generate iCal/ICS calendar feeds
- [ ] Create calendar subscription endpoints
- [ ] Implement calendar feed regeneration on habit changes
- [ ] Add calendar customization options (colors, descriptions)
- [ ] Support multiple calendar feeds (work vs personal)

### Phase 5: Work Schedule Integration

- [ ] Create work schedule configuration interface
- [ ] Support multiple work schedule patterns
- [ ] Add holiday and time-off management
- [ ] Implement dynamic schedule adjustments
- [ ] Add integration with external calendar APIs (Google Calendar, Outlook)

### Phase 6: Advanced Features

- [ ] Habit completion tracking and statistics
- [ ] Smart suggestions based on habit patterns
- [ ] Habit streak tracking and motivation
- [ ] Weekly/monthly habit reviews
- [ ] Export/import functionality
- [ ] Mobile-responsive design improvements

### Phase 7: Analytics & Insights

- [ ] Create habit completion dashboard
- [ ] Add trend analysis and reporting
- [ ] Implement habit success metrics
- [ ] Build recommendation engine for habit adjustments
- [ ] Add personal insights and goal tracking

## Database Schema (Deno KV)

### Users

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  workHours?: WorkHours;
  timezone: string;
}
```

### Habits

```typescript
interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: "people" | "activities" | "responsibilities";
  frequency: {
    type: "daily" | "weekly" | "monthly" | "custom";
    interval: number; // For custom frequencies
    weekdays?: number[]; // For weekly patterns
  };
  duration: number; // minutes
  priority: "low" | "medium" | "high";
  tags: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Work Hours

```typescript
interface WorkHours {
  monday: { start: string; end: string } | null;
  tuesday: { start: string; end: string } | null;
  wednesday: { start: string; end: string } | null;
  thursday: { start: string; end: string } | null;
  friday: { start: string; end: string } | null;
  saturday: { start: string; end: string } | null;
  sunday: { start: string; end: string } | null;
}
```

### Habit Completions

```typescript
interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  completedAt: Date;
  scheduledFor: Date;
  notes?: string;
}
```

## API Routes Structure

```
/api/
├── auth/
│   ├── login
│   ├── logout
│   └── register
├── habits/
│   ├── [id] (GET, PUT, DELETE)
│   └── index (GET, POST)
├── calendar/
│   ├── generate
│   └── feed/[userId].ics
├── work-hours/
│   └── [userId] (GET, PUT)
└── completions/
    ├── [habitId] (GET, POST)
    └── stats/[userId]
```

## Key Features to Implement

### Smart Scheduling Algorithm

1. **Priority Scoring**: Combine habit priority, frequency requirements, and
   time since last completion
2. **Conflict Avoidance**: Check against work hours and existing calendar events
3. **Optimal Spacing**: Distribute habits evenly to avoid clustering
4. **Adaptive Timing**: Learn from user completion patterns to suggest better
   times

### Calendar Feed Generation

1. **Standard iCal Format**: Compatible with all major calendar applications
2. **Dynamic Updates**: Auto-refresh when habits change
3. **Color Coding**: Different colors for each habit category
4. **Rich Descriptions**: Include habit details and completion instructions

### User Experience Enhancements

1. **Progressive Web App**: Offline capability and mobile optimization
2. **Habit Templates**: Pre-built habits for common activities
3. **Batch Operations**: Bulk edit multiple habits
4. **Quick Actions**: One-click habit completion and rescheduling

## Testing Strategy

- [ ] Unit tests for scheduling algorithm
- [ ] Integration tests for calendar generation
- [ ] E2E tests for user workflows
- [ ] Performance tests for large habit datasets
- [ ] Calendar client compatibility tests

## Deployment & Infrastructure

- [ ] Set up Deno Deploy hosting
- [ ] Configure domain and SSL
- [ ] Set up monitoring and logging
- [ ] Implement backup strategy for Deno KV
- [ ] Create deployment pipeline

## Security Considerations

- [ ] Input validation and sanitization
- [ ] Rate limiting on API endpoints
- [ ] Secure session management
- [ ] HTTPS enforcement
- [ ] Data encryption for sensitive information

## Future Enhancements

- [ ] Team/family habit sharing
- [ ] Integration with fitness trackers
- [ ] AI-powered habit recommendations
- [ ] Social features and habit communities
- [ ] Advanced analytics and machine learning insights
