# AppContext Analysis and Recommendations

## Current State Analysis

The current `AppContext.tsx` shows signs of **prop drilling** and **state management complexity** that could be improved.

### Issues Identified

#### 1. **Overly Large Context Interface**
- `AppContextType` has **25+ methods and properties**
- Handles user state, matches, chats, UI state, business logic all in one place
- This violates the Single Responsibility Principle

#### 2. **Mixed Concerns**
- **User data management** (user, updateUser, setUser)
- **Dating logic** (matches, likes, swipes)
- **UI state** (view, activeChatId, showMatchOverlay)
- **Business logic** (tryConsumeLike, recordCardSeen, etc.)
- **Admin functions** (reportUser, blockUser, deleteAccount)

#### 3. **Prop Drilling Evidence**
- Components need to import many context values they don't directly use
- Example: Discovery component needs `likesRemaining`, `tryConsumeLike`, `recordCardSeen`, `cardsRemainingInDeck`, etc.

#### 4. **Complex State Updates**
- `mergeDailyReset` function is complex and error-prone
- Multiple useEffect hooks for localStorage synchronization
- Business logic mixed with state management

## Recommended Architecture

### 1. **Split Context by Domain**

```typescript
// UserContext - Pure user data management
interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateUser: (patch: Partial<UserProfile>) => void;
}

// DatingContext - Dating-specific logic
interface DatingContextType {
  matches: UserProfile[];
  likesRemaining: number;
  cardsRemainingInDeck: number;
  tryConsumeLike: () => boolean;
  recordCardSeen: () => void;
  addMatch: (profile: UserProfile) => void;
}

// UIContext - UI state management
interface UIContextType {
  view: 'onboarding' | 'discovery' | 'chats' | 'profile';
  setView: (view: ViewType) => void;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  showMatchOverlay: UserProfile | null;
  setShowMatchOverlay: (profile: UserProfile | null) => void;
}

// ChatContext - Chat management
interface ChatContextType {
  chats: Chat[];
  addMessage: (chatId: string, text: string) => void;
  addVoiceMessage: (chatId: string, audioUrl: string, durationSec: number) => void;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
}
```

### 2. **Custom Hooks for Business Logic**

```typescript
// hooks/useDatingLogic.ts
export const useDatingLogic = () => {
  const { user } = useUser();
  
  const tryConsumeLike = useCallback(() => {
    // Like consumption logic
  }, [user]);
  
  const recordCardSeen = useCallback(() => {
    // Card seen logic
  }, []);
  
  return { tryConsumeLike, recordCardSeen };
};

// hooks/useChatLogic.ts
export const useChatLogic = () => {
  // Chat-specific business logic
  const addMessage = useCallback((chatId: string, text: string) => {
    // Message adding logic
  }, []);
  
  return { addMessage };
};
```

### 3. **State Management with Zustand/Jotai**

Consider using a state management library:

```typescript
// stores/userStore.ts
import { create } from 'zustand';

interface UserStore {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateUser: (patch: Partial<UserProfile>) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateUser: (patch) => set((state) => ({
    user: state.user ? { ...state.user, ...patch } : null
  })),
}));
```

### 4. **Service Layer**

```typescript
// services/datingService.ts
export class DatingService {
  static async consumeLike(userId: string): Promise<boolean> {
    // API call to consume like
    return true;
  }
  
  static async recordSwipe(userId: string, profileId: string, direction: 'left' | 'right'): Promise<void> {
    // API call to record swipe
  }
}
```

## Implementation Priority

### Phase 1: Split Contexts (High Priority)
1. Create `UserContext` with basic user management
2. Create `UIContext` for view management
3. Migrate components gradually

### Phase 2: Business Logic Extraction (Medium Priority)
1. Create custom hooks for dating logic
2. Create service layer for API calls
3. Remove business logic from contexts

### Phase 3: State Management Upgrade (Low Priority)
1. Evaluate and implement Zustand or similar
2. Migrate all contexts
3. Add persistence layer

## Benefits of This Approach

1. **Reduced Prop Drilling**: Components only import what they need
2. **Better Testability**: Each context can be tested independently
3. **Improved Performance**: Smaller re-renders
4. **Code Organization**: Clear separation of concerns
5. **Maintainability**: Easier to modify specific features
6. **Type Safety**: Better TypeScript support

## Migration Strategy

1. **Start New**: Create new contexts alongside existing
2. **Gradual Migration**: Move one component at a time
3. **Testing**: Ensure feature parity
4. **Cleanup**: Remove old context once migration complete

This approach will significantly improve the codebase architecture while maintaining all existing functionality.
