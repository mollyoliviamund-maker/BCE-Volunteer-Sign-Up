import React, { useState, useMemo } from 'react';
import { 
  format, 
  endOfMonth, 
  eachDayOfInterval, 
  addMonths, 
  isSameDay,
  getDay,
  isAfter,
  isBefore
} from 'date-fns';
import { ChevronLeft, ChevronRight, Check, AlertCircle, Calendar as CalendarIcon, Download, AlertTriangle, X } from 'lucide-react';
import { ClassType, SignupType, Volunteer } from '../types';
import { isDateSelectable, generateRecurringDates, downloadICSFile, generateUUID } from '../utils/dateUtils';
import { CLASS_CONFIG, SCHOOL_YEAR_END } from '../constants';
import { Button } from '../components/Button';
import { useVolunteerStore } from '../store/VolunteerContext';

interface CalendarSchedulerProps {
  classType: ClassType;
  onComplete: () => void;
}

export const CalendarScheduler: React.FC<CalendarSchedulerProps> = ({ classType, onComplete }) => {
  const { volunteers, addVolunteer } = useVolunteerStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [excludedRecurringDates, setExcludedRecurringDates] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    parentName: '',
    studentName: '',
    email: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastSubmittedVolunteer, setLastSubmittedVolunteer] = useState<Volunteer | null>(null);

  // 1. Calculate Booked Dates for this Class Type
  const bookedDates = useMemo(() => {
    const set = new Set<string>();
    volunteers.forEach(v => {
      // Only care about this class type and Time Slot signups
      if (v.classType === classType && v.signupType === SignupType.TIME_SLOT && v.dates) {
        v.dates.forEach(date => set.add(date));
      }
    });
    return set;
  }, [volunteers, classType]);

  // Calendar Generation
  // Manually calc startOfMonth
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Pad the start of the week
  const startPadding = Array(getDay(monthStart)).fill(null);

  // Navigation Limits
  const nextMonthDate = addMonths(currentDate, 1);
  const prevMonthDate = addMonths(currentDate, -1);
  
  // Disable next if the start of next month is after the school year end
  const nextMonthStart = new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), 1);
  const isNextDisabled = isAfter(nextMonthStart, SCHOOL_YEAR_END);
  
  // Disable prev if the end of previous month is before today (cannot book in past months)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const isPrevDisabled = isBefore(endOfMonth(prevMonthDate), todayStart);

  const handlePrevMonth = () => {
    if (!isPrevDisabled) setCurrentDate(prevMonthDate);
  };

  const handleNextMonth = () => {
    if (!isNextDisabled) setCurrentDate(nextMonthDate);
  };

  const handleDateClick = (date: Date) => {
    const { selectable } = isDateSelectable(date, classType);
    const dateKey = format(date, 'yyyy-MM-dd');
    const isBooked = bookedDates.has(dateKey);

    if (selectable && !isBooked) {
      setSelectedDate(date);
      setExcludedRecurringDates([]); // Reset exclusions when date changes
    }
  };

  const recurringDates = useMemo(() => {
    if (!selectedDate || !isRecurring) return [];
    
    // Generate all theoretically possible dates
    const allPossibleDates = generateRecurringDates(selectedDate, classType);
    
    // Filter out dates that are already booked
    return allPossibleDates.filter(d => !bookedDates.has(format(d, 'yyyy-MM-dd')));
  }, [selectedDate, isRecurring, classType, bookedDates]);

  // Filter out dates user manually unchecked
  const finalDatesToSubmit = useMemo(() => {
    if(!isRecurring && selectedDate) return [selectedDate];
    return recurringDates.filter(d => !excludedRecurringDates.includes(format(d, 'yyyy-MM-dd')));
  }, [recurringDates, excludedRecurringDates, isRecurring, selectedDate]);

  // Check if any recurring dates were skipped due to being full
  const hasSkippedDates = useMemo(() => {
    if (!selectedDate || !isRecurring) return false;
    const allPossible = generateRecurringDates(selectedDate, classType);
    return allPossible.length !== recurringDates.length;
  }, [selectedDate, isRecurring, classType, recurringDates]);

  const toggleExcludedDate = (dateStr: string) => {
    setExcludedRecurringDates(prev => 
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    const datesToSave = finalDatesToSubmit.map(d => format(d, 'yyyy-MM-dd'));

    const newVolunteer: Volunteer = {
      id: generateUUID(),
      ...formData,
      classType,
      signupType: SignupType.TIME_SLOT,
      isRecurring,
      dates: datesToSave,
      submittedAt: new Date().toISOString()
    };

    addVolunteer(newVolunteer);
    setLastSubmittedVolunteer(newVolunteer);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-2xl mx-auto border-t-4 border-violet-400 animate-fade-in">
        <div className="w-16 h-16 bg-violet-50 text-violet-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={32} strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-bold text-slate-700 mb-4">You're Signed Up!</h2>
        <p className="text-slate-600 mb-8">
          Thank you, {formData.parentName}. We have scheduled you for {isRecurring ? 'recurring visits' : 'a visit'} to the {CLASS_CONFIG[classType].name} class.
        </p>

        {lastSubmittedVolunteer && (
          <button 
            onClick={() => downloadICSFile(lastSubmittedVolunteer)}
            className="w-full md:w-auto mb-6 inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-100 text-violet-700 rounded-xl font-medium hover:bg-violet-200 transition-colors"
          >
            <CalendarIcon size={18} />
            <span>Add to My Calendar</span>
            <Download size={14} className="opacity-60" />
          </button>
        )}
        
        <div className="border-t border-slate-100 pt-6">
          <Button onClick={onComplete} variant="ghost">Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      {/* Left Column: Calendar */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-700">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={handlePrevMonth} 
                disabled={isPrevDisabled}
                className={`p-2 rounded-lg transition-colors ${isPrevDisabled ? 'text-slate-200 cursor-not-allowed' : 'hover:bg-slate-50 text-slate-500'}`}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={handleNextMonth} 
                disabled={isNextDisabled}
                className={`p-2 rounded-lg transition-colors ${isNextDisabled ? 'text-slate-200 cursor-not-allowed' : 'hover:bg-slate-50 text-slate-500'}`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {startPadding.map((_, i) => <div key={`pad-${i}`} />)}
            {calendarDays.map(day => {
              const { selectable, reason } = isDateSelectable(day, classType);
              const dateKey = format(day, 'yyyy-MM-dd');
              const isBooked = bookedDates.has(dateKey);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              
              // Determine visual state
              let baseClasses = "bg-white text-slate-600 border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 hover:shadow-sm";
              let disabled = false;
              let label = format(day, 'd');
              let subLabel = null;

              if (isSelected) {
                baseClasses = "bg-violet-400 text-white border-violet-400 shadow-md shadow-violet-200 transform scale-105 z-10";
              } else if (isBooked) {
                baseClasses = "bg-rose-50 text-rose-300 border-rose-50 cursor-not-allowed";
                disabled = true;
                subLabel = "Full";
              } else if (!selectable) {
                baseClasses = "bg-slate-50/50 text-slate-300 border-transparent cursor-not-allowed";
                disabled = true;
                subLabel = reason;
              }

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  disabled={disabled}
                  className={`
                    relative h-14 md:h-16 rounded-xl border flex flex-col items-center justify-center transition-all
                    ${baseClasses}
                  `}
                >
                  <span className={`text-sm font-medium`}>
                    {label}
                  </span>
                  {subLabel && (
                    <span className="text-[10px] leading-tight text-center px-1 opacity-80 truncate w-full">
                      {subLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-50 border border-slate-200"></div>
              <span>Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-50 border border-rose-100"></div>
              <span>Full</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white border border-slate-200"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-violet-400"></div>
              <span>Selected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="lg:col-span-5">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg shadow-violet-100/50 border border-violet-50 sticky top-24">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-700 mb-1">Confirm your spot</h3>
            {selectedDate ? (
              <p className="text-violet-500 font-medium">{format(selectedDate, 'EEEE, MMMM do, yyyy')}</p>
            ) : (
               <p className="text-slate-400 text-sm flex items-center gap-2">
                 <AlertCircle size={16} /> Select a date from the calendar
               </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Parent Name</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-violet-300 focus:border-transparent outline-none transition-all"
                placeholder="Parent First & Last Name"
                value={formData.parentName}
                onChange={e => setFormData({...formData, parentName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Student Name</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-violet-300 focus:border-transparent outline-none transition-all"
                placeholder="Student First & Last Name"
                value={formData.studentName}
                onChange={e => setFormData({...formData, studentName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
              <input 
                required
                type="email" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-violet-300 focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
               <label className="flex items-start gap-3 p-3 rounded-lg border border-violet-100 bg-violet-50/50 cursor-pointer hover:bg-violet-50 transition-colors">
                  <div className="flex h-5 items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-violet-300 text-violet-500 focus:ring-violet-400"
                      checked={isRecurring}
                      onChange={e => setIsRecurring(e.target.checked)}
                      disabled={!selectedDate}
                    />
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-slate-700">Make this recurring?</span>
                    <p className="text-slate-500 mt-1">
                      Checking this will sign you up for <strong>every {selectedDate ? format(selectedDate, 'EEEE') : 'week'}</strong> for the rest of the school year.
                      <span className="block mt-1 font-medium text-slate-600">You can deselect specific dates below if you have conflicts.</span>
                    </p>
                    <p className="text-slate-500 text-xs italic mt-2">
                       You can always email <a href="mailto:fhohn@dcsdk12.org" className="text-violet-600 hover:underline">fhohn@dcsdk12.org</a> if you find you can't make a recurring time slot after you sign up!
                    </p>
                  </div>
               </label>

               {/* RECURRING DATE REVIEW SECTION */}
               {isRecurring && selectedDate && (
                  <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-sm font-semibold text-slate-700">Review Dates ({finalDatesToSubmit.length})</span>
                       <span className="text-xs text-slate-400">Uncheck to skip specific weeks</span>
                    </div>
                    
                    {hasSkippedDates && (
                        <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-2 rounded text-xs mb-3 border border-amber-100">
                            <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                            <span>Note: Some weeks are already full and have been automatically skipped.</span>
                        </div>
                    )}

                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                       {recurringDates.map(date => {
                         const dateStr = format(date, 'yyyy-MM-dd');
                         const isExcluded = excludedRecurringDates.includes(dateStr);
                         return (
                           <div key={dateStr} className={`flex items-center justify-between p-2 rounded-lg text-sm border ${isExcluded ? 'bg-slate-100 border-transparent opacity-60' : 'bg-white border-violet-100'}`}>
                              <span className={isExcluded ? 'text-slate-400 line-through' : 'text-slate-600'}>
                                {format(date, 'MMM d, yyyy')}
                              </span>
                              <button 
                                type="button"
                                onClick={() => toggleExcludedDate(dateStr)}
                                className={`p-1 rounded ${isExcluded ? 'text-slate-400 hover:bg-slate-200' : 'text-rose-400 hover:bg-rose-50'}`}
                              >
                                {isExcluded ? <span className="text-xs font-medium">Skipped</span> : <X size={14} />}
                              </button>
                           </div>
                         )
                       })}
                    </div>
                  </div>
               )}
            </div>

            <Button 
              type="submit" 
              fullWidth 
              disabled={!selectedDate || !formData.email || !formData.parentName || !formData.studentName || finalDatesToSubmit.length === 0}
              className="mt-4"
            >
              Sign Up Now
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};