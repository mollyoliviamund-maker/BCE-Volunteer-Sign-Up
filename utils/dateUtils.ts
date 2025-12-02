import { isSameDay, isWithinInterval, isWeekend, getDay, format } from 'date-fns';
import { HOLIDAYS, SCHOOL_YEAR_END, SCHOOL_YEAR_START, CLASS_CONFIG } from '../constants';
import { ClassType, Volunteer } from '../types';

// Robust UUID generator that falls back if crypto is not available
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Helper to parse YYYY-MM-DD to local Date (replaces parseISO)
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const isSchoolHoliday = (date: Date): string | null => {
  for (const holiday of HOLIDAYS) {
    const start = parseLocalDate(holiday.start);
    const end = parseLocalDate(holiday.end);
    if (isWithinInterval(date, { start, end })) {
      return holiday.name;
    }
  }
  return null;
};

export const isDateSelectable = (date: Date, classType: ClassType): { selectable: boolean; reason?: string } => {
  // Check bounds
  if (date < new Date() || date < SCHOOL_YEAR_START || date > SCHOOL_YEAR_END) {
    return { selectable: false, reason: 'Outside school year' };
  }

  // Check weekends (generic)
  if (isWeekend(date)) {
    return { selectable: false, reason: 'Weekend' };
  }

  // Check class specific days
  const dayOfWeek = getDay(date); // 0=Sun, 1=Mon...
  if (!CLASS_CONFIG[classType].allowedDays.includes(dayOfWeek)) {
    return { selectable: false, reason: 'No class this day' };
  }

  // Check holidays
  const holidayName = isSchoolHoliday(date);
  if (holidayName) {
    return { selectable: false, reason: holidayName };
  }

  return { selectable: true };
};

export const generateRecurringDates = (startDate: Date, classType: ClassType): Date[] => {
  const dates: Date[] = [];
  const dayOfWeek = getDay(startDate);
  let current = new Date(startDate);

  while (current <= SCHOOL_YEAR_END) {
    const { selectable } = isDateSelectable(current, classType);
    if (selectable && getDay(current) === dayOfWeek) {
      dates.push(new Date(current));
    }
    // Advance one week
    current.setDate(current.getDate() + 7);
  }
  return dates;
};

// --- ICS Generation Utilities ---

const formatICSDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

export const downloadICSFile = (volunteer: Volunteer) => {
  if (!volunteer.dates || volunteer.dates.length === 0) return;

  const firstDate = parseLocalDate(volunteer.dates[0]);
  
  // Set times based on class type
  // AM: 8:30 - 11:10 | PM: 12:30 - 15:30
  const startTime = new Date(firstDate);
  const endTime = new Date(firstDate);
  
  if (volunteer.classType === ClassType.AM_3YO) {
    startTime.setHours(8, 30, 0);
    endTime.setHours(11, 10, 0);
  } else {
    startTime.setHours(12, 30, 0);
    endTime.setHours(15, 30, 0);
  }

  const now = new Date();
  const title = `Volunteer: Bear Canyon ${CLASS_CONFIG[volunteer.classType].name}`;
  const description = `Thank you for volunteering! \n\nParent: ${volunteer.parentName}\nStudent: ${volunteer.studentName}\nClass: ${CLASS_CONFIG[volunteer.classType].name}`;
  const location = "Bear Canyon Preschool";

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bear Canyon Volunteers//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${volunteer.id}@bearcanyonvolunteers`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(startTime)}`,
    `DTEND:${formatICSDate(endTime)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT24H', // Reminder 24 hours before
    'ACTION:DISPLAY',
    'DESCRIPTION:Volunteer Reminder',
    'END:VALARM'
  ];

  if (volunteer.isRecurring) {
    // RRULE:FREQ=WEEKLY;UNTIL=20260529T000000Z
    // We use the school year end as the limit
    const untilDate = new Date(SCHOOL_YEAR_END);
    untilDate.setHours(23, 59, 59);
    icsContent.push(`RRULE:FREQ=WEEKLY;UNTIL=${formatICSDate(untilDate)}`);
  }

  icsContent.push('END:VEVENT');
  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'volunteer-schedule.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};