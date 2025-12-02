
export enum ClassType {
  AM_3YO = 'AM_3YO',
  PM_4YO = 'PM_4YO'
}

export enum SignupType {
  TIME_SLOT = 'TIME_SLOT',
  ACTIVITY_INTEREST = 'ACTIVITY_INTEREST'
}

export interface Volunteer {
  id: string;
  parentName: string;
  studentName: string;
  email: string;
  classType: ClassType;
  signupType: SignupType;
  dates?: string[]; // ISO date strings
  isRecurring?: boolean;
  activityInterests?: string[];
  otherDetails?: string; // For "Other" activity descriptions
  submittedAt: string;
  // Admin Tracking
  adminNotes?: string;
  isContacted?: boolean;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isDisabled: boolean;
  reason?: string; // Holiday, Weekend, etc.
}
