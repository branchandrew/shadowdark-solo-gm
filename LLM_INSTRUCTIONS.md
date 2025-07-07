# LLM Development Instructions - Real-Time Database Pattern

## Architecture Pattern

This project follows a **Real-Time Database-as-Source-of-Truth** pattern. You MUST adhere to these principles:

### 1. Database-Centric Architecture

```
Frontend ←── Real-time ──→ Database (Supabase) ←── Writes ──→ Backend
```

**Core Principle**: "Let the database be the source of truth. The UI just listens and renders."

- ✅ **Frontend reads directly from database** (via real-time subscriptions)
- ✅ **Backend writes directly to database** (not to frontend)
- ✅ **Frontend and backend communicate through database** (not direct API calls)
- ✅ **UI automatically updates** when database changes

### 2. Data Flow Rules

**DO THIS:**

```typescript
// Backend writes to database
await serverDB.writeAdventureArc(sessionId, adventureArc);

// Frontend automatically receives updates via real-time subscription
const { data, updateData } = useDatabase("adventure_arc", null);
```

**DON'T DO THIS:**

```typescript
// ❌ Don't make frontend fetch data from backend directly
const response = await fetch("/api/get-adventure");
const data = await response.json();
```

### 3. Component Development Guidelines

#### A. Always Use Database Hooks

```typescript
// ✅ Correct - use database hooks
import {
  useCharacter,
  useAdventureArc,
  useDatabase,
} from "@/hooks/useDatabase";

function MyComponent() {
  const { data: character, updateData: updateCharacter } = useCharacter();
  const { data: adventureArc } = useAdventureArc();

  // Component automatically re-renders when database changes
}
```

#### B. Never Use Direct localStorage

```typescript
// ❌ Wrong
const character = localStorage.getItem("character");

// ✅ Correct
const { data: character } = useCharacter();
```

#### C. Server Actions Write to Database

```typescript
// ✅ Correct server pattern
export const generateAdventure: RequestHandler = async (req, res) => {
  const { session_id } = req.body;

  // Generate data
  const adventureArc = await generateAdventureData();

  // Write to database (this triggers real-time updates to frontend)
  await serverDB.writeAdventureArc(session_id, adventureArc);

  // Simple success response (data flows through database)
  res.json({ success: true });
};
```

### 4. Shared Types (Critical)

All data structures MUST be defined in `shared/types.ts` and used by both frontend and backend:

```typescript
// shared/types.ts
export interface GameSession {
  id: string;
  character_data: Character | null;
  adventure_arc: AdventureArc | null;
  // ... other fields
}

// Use in frontend
import type { GameSession } from "../../shared/types";

// Use in backend
import type { GameSession } from "../../shared/types";
```

**Never duplicate type definitions** between frontend and backend.

### 5. Real-Time Subscription Pattern

When creating new components that use data:

```typescript
function MyComponent() {
  // This hook automatically:
  // 1. Loads data from localStorage/database
  // 2. Sets up real-time subscriptions
  // 3. Updates component when database changes
  const { data, updateData, isLoading, error } = useDatabase("my_data", defaultValue);

  // Component re-renders automatically when other users/backend update the database
  return <div>{data?.someField}</div>;
}
```

### 6. When Adding New Features

#### A. Define Types First

```typescript
// 1. Add to shared/types.ts
export interface NewFeature {
  id: string;
  name: string;
  // ... fields
}
```

#### B. Add Database Schema

```sql
-- 2. Update supabase-schema.sql
ALTER TABLE game_sessions ADD COLUMN new_feature JSONB;
```

#### C. Create Database Service Methods

```typescript
// 3. Add to server/lib/database.ts
async writeNewFeature(sessionId: string, data: NewFeature) {
  await this.supabase.from("game_sessions").upsert({
    id: sessionId,
    new_feature: data,
    updated_at: new Date().toISOString(),
  });
}
```

#### D. Create Hook

```typescript
// 4. Add to client/hooks/useDatabase.ts
export function useNewFeature() {
  return useDatabase("new_feature", null);
}
```

#### E. Backend Writes, Frontend Listens

```typescript
// 5. Backend action
const data = await processNewFeature();
await serverDB.writeNewFeature(session_id, data);

// 6. Frontend component (automatically receives updates)
const { data: newFeature } = useNewFeature();
```

### 7. State Management Rules

- ❌ **No Redux/Zustand** - Database is the state manager
- ❌ **No complex React state flows** - Use database hooks
- ❌ **No prop drilling** - Each component gets data from database
- ✅ **Database hooks only** - `useDatabase`, `useCharacter`, etc.
- ✅ **Local state for UI only** - modals, form inputs, loading states

### 8. API Endpoint Guidelines

Backend endpoints should:

```typescript
// ✅ Correct pattern
export const myAction: RequestHandler = async (req, res) => {
  const { session_id, ...params } = req.body;

  // 1. Process the request
  const result = await processData(params);

  // 2. Write to database (triggers real-time updates)
  await serverDB.writeMyData(session_id, result);

  // 3. Simple response (data flows through database)
  res.json({ success: true });
};
```

**Don't return processed data** - let it flow through the database.

### 9. Error Handling

```typescript
// Frontend error handling
const { data, updateData, error } = useDatabase("my_data", null);

if (error) {
  return <div>Error: {error}</div>;
}

// Backend error handling
try {
  await serverDB.writeData(session_id, data);
  res.json({ success: true });
} catch (error) {
  res.status(500).json({ success: false, error: error.message });
}
```

### 10. Testing the Pattern

When implementing features, verify:

- ✅ Data flows: Backend → Database → Frontend (real-time)
- ✅ Multiple browser tabs update simultaneously
- ✅ Works offline (localStorage fallback)
- ✅ Types are shared and consistent
- ✅ No direct frontend-backend communication

### 11. Migration Strategy

When updating existing code:

1. **Identify localStorage usage** → Replace with database hooks
2. **Find direct API calls** → Replace with database-write pattern
3. **Remove state management** → Let database manage state
4. **Add real-time subscriptions** → Use existing database hooks

### 12. Common Anti-Patterns to Avoid

```typescript
// ❌ Direct localStorage access
localStorage.setItem("data", JSON.stringify(data));

// ❌ Frontend fetching from backend
const data = await fetch("/api/get-data").then(r => r.json());

// ❌ Backend returning data instead of writing to database
res.json({ data: processedData });

// ❌ Complex React state management
const [data, setData] = useState();
useEffect(() => { /* complex sync logic */ }, []);

// ❌ Prop drilling
<Child data={data} onUpdate={setData} />
```

**Always ask**: "Is the database the source of truth here?" If not, refactor.

---

## Quick Reference

- **New data**: Backend writes to database → Frontend automatically updates
- **User interactions**: Use database hooks to read/write
- **Real-time**: Built-in via Supabase subscriptions
- **Types**: Always shared between frontend/backend
- **State**: Database manages it, components just render
- **API calls**: Only for triggering backend actions, not getting data

Follow this pattern for scalable, real-time, collaborative applications.
