// Synthetic, desk-safe view data. Replace at the shared service boundary later.
export type DeskChild = {
  id: string;
  name: string;
  otherNames: string[];
  age: number;
  group: string;
  lessonDay: string;
  profileComplete: boolean;
  status: 'expected' | 'checked-in' | 'released';
  bib?: string;
  checkedInAt?: string;
  checkedInBy?: string;
  medicationHeldAtDesk?: boolean;
};

export const lessonDays = ['2026-12-12', '2026-12-13', '2026-12-19'];
export const mockDeskStaff = 'Jordan Ellis (demo desk staff)';
export const initialRoster: DeskChild[] = [
  { id: 'owen', name: 'Owen Parr', otherNames: ['Owen Okafor-Parr'], age: 8, group: 'Snow Owls', lessonDay: lessonDays[0], profileComplete: false, status: 'expected' },
  { id: 'ava', name: 'Ava Chen', otherNames: [], age: 7, group: 'Snow Owls', lessonDay: lessonDays[0], profileComplete: true, status: 'expected', medicationHeldAtDesk: true },
  { id: 'lily', name: 'Lily Whitfield', otherNames: [], age: 6, group: 'Little Kestrels', lessonDay: lessonDays[0], profileComplete: true, status: 'checked-in', bib: '11', checkedInAt: '2026-12-12T09:05:00-08:00', checkedInBy: mockDeskStaff },
  { id: 'maya', name: 'Maya Brooks', otherNames: [], age: 10, group: 'Alpine Falcons', lessonDay: lessonDays[0], profileComplete: false, status: 'expected' },
  { id: 'leo', name: 'Leo Martin', otherNames: [], age: 9, group: 'Alpine Falcons', lessonDay: lessonDays[0], profileComplete: true, status: 'released', bib: '23', checkedInAt: '2026-12-12T09:12:00-08:00', checkedInBy: mockDeskStaff },
  { id: 'sam', name: 'Sam Rivera', otherNames: ['Samuel Rivera'], age: 8, group: 'Snow Owls', lessonDay: lessonDays[1], profileComplete: true, status: 'expected' },
];
