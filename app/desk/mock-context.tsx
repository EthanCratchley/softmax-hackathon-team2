'use client';

import { createContext, useContext, useReducer, useState, type Dispatch, type ReactNode } from 'react';
import { lessonDays } from '@/lib/desk/fixtures';
import { createMockDeskState, mockDeskReducer, type MockDeskAction, type MockDeskState } from '@/lib/desk/pickup-mock';

const DeskMockContext = createContext<{
  state: MockDeskState;
  dispatch: Dispatch<MockDeskAction>;
  day: string;
  setDay: Dispatch<React.SetStateAction<string>>;
} | null>(null);

export function DeskMockProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mockDeskReducer, undefined, createMockDeskState);
  const [day, setDay] = useState(lessonDays[0]);
  return <DeskMockContext.Provider value={{ state, dispatch, day, setDay }}>{children}</DeskMockContext.Provider>;
}

export function useDeskMock() {
  const context = useContext(DeskMockContext);
  if (!context) throw new Error('Desk mock must be used within its desk layout.');
  return context;
}
