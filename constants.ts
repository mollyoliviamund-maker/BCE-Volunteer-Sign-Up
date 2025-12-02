import { ClassType } from "./types";

// ==========================================================================================
// CONFIGURATION
// ==========================================================================================
// PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
// Example: "https://script.google.com/macros/s/AKfycbx.../exec"
export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyE_GJAsJhWnLlz94ZtXsabpXgXl3OwZ-V2Khoa-wz4Y4HtmZKmoVXJzXxx6XncizPu/exec"; 
// ==========================================================================================


export const SCHOOL_YEAR_START = new Date(2025, 7, 13); // Aug 13, 2025
export const SCHOOL_YEAR_END = new Date(2026, 4, 29); // May 29, 2026

// Holiday ranges (Inclusive)
// Format: [Start Date String, End Date String] or Single Date String
export const HOLIDAYS = [
  // 2025
  { start: '2025-07-04', end: '2025-07-04', name: 'Independence Day' },
  { start: '2025-09-01', end: '2025-09-01', name: 'Labor Day' },
  { start: '2025-09-22', end: '2025-09-22', name: 'Prof. Dev Day' },
  { start: '2025-10-13', end: '2025-10-17', name: 'Fall Break' },
  { start: '2025-11-24', end: '2025-11-28', name: 'Thanksgiving Break' },
  { start: '2025-12-19', end: '2025-12-19', name: 'Teacher Work Day' },
  { start: '2025-12-22', end: '2026-01-05', name: 'Winter Break' }, 
  // 2026
  { start: '2026-01-19', end: '2026-01-19', name: 'MLK Day' },
  { start: '2026-02-13', end: '2026-02-13', name: 'Prof. Dev Day' },
  { start: '2026-02-16', end: '2026-02-16', name: 'Presidents Day' },
  { start: '2026-03-16', end: '2026-03-20', name: 'Spring Break' },
  { start: '2026-04-24', end: '2026-04-24', name: 'Prof. Dev Day' },
  { start: '2026-04-27', end: '2026-04-27', name: 'Compensation Day' },
  { start: '2026-05-25', end: '2026-05-25', name: 'Memorial Day' },
];

export const CLASS_CONFIG = {
  [ClassType.AM_3YO]: {
    name: '3 Year Olds (AM)',
    schedule: 'Monday - Thursday',
    allowedDays: [1, 2, 3, 4], // Mon=1, Thu=4
    time: '8:30 AM - 11:10 AM'
  },
  [ClassType.PM_4YO]: {
    name: '4 Year Olds (PM)',
    schedule: 'Monday - Friday',
    allowedDays: [1, 2, 3, 4, 5], // Mon=1, Fri=5
    time: '12:30 PM - 3:30 PM'
  }
};

export const ACTIVITIES = [
  "Classroom Reading",
  "Arts & Crafts Assistance",
  "Holiday Parties",
  "Material Prep (At Home)"
];