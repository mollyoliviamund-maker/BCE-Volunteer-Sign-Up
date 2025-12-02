import React, { useState, useMemo } from 'react';
import { useVolunteerStore } from '../store/VolunteerContext';
import { SignupType, ClassType } from '../types';
import { CLASS_CONFIG, ACTIVITIES } from '../constants';
import { Button } from '../components/Button';
import { Lock, LogOut, Calendar, List, Bell, Mail, Send, MessageSquareQuote, Search, Filter, Trash2 } from 'lucide-react';
import { format, isValid, addDays, isSameDay } from 'date-fns';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { volunteers, updateVolunteer, deleteVolunteer } = useVolunteerStore();
  const [activeTab, setActiveTab] = useState<'schedule' | 'interests'>('schedule');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<string>('All');
  const [interestSearch, setInterestSearch] = useState('');

  // Filtering Logic for Interest List
  const interestVolunteers = useMemo(() => {
    let list = volunteers.filter(v => v.signupType === SignupType.ACTIVITY_INTEREST);
    if (selectedActivityFilter !== 'All') {
      list = list.filter(v => v.activityInterests?.includes(selectedActivityFilter));
    }
    if (interestSearch) {
      const q = interestSearch.toLowerCase();
      list = list.filter(v => 
        v.parentName.toLowerCase().includes(q) || 
        v.studentName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [volunteers, selectedActivityFilter, interestSearch]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'bearcanyon') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password. Try "bearcanyon"');
    }
  };

  // --- DELETE LOGIC ---
  const handleDeleteSlot = (e: React.MouseEvent, id: string, dateString: string) => {
    e.stopPropagation(); // Stop table row click event
    e.preventDefault();  // Stop any form submission
    
    const cleanDate = dateString.trim();
    console.log("Delete button clicked for:", { id, cleanDate }); 

    // Directly call delete without window.confirm to prevent browser blocking issues
    deleteVolunteer(id, cleanDate);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full space-y-4">
          <div className="text-center mb-4">
            <div className="bg-violet-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="text-violet-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-700">Teacher Login</h2>
          </div>
          <input 
            type="password" 
            placeholder="Enter password" 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-400 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button fullWidth type="submit">Access Dashboard</Button>
          <button type="button" onClick={onLogout} className="w-full text-center text-sm text-slate-400 mt-2 hover:text-slate-600">Cancel</button>
        </form>
      </div>
    );
  }

  // Flatten schedule for calendar list view
  const scheduleVolunteers = volunteers.filter(v => v.signupType === SignupType.TIME_SLOT);
  const flattenedSchedule = scheduleVolunteers.flatMap(v => 
    (v.dates || []).map(date => ({
      date: date, // Keep original string
      ...v
    }))
  ).sort((a, b) => a.date.localeCompare(b.date));

  // Reminder Logic
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = addDays(today, 1);
  
  const upcomingReminders = flattenedSchedule.filter(item => {
    // Basic date check for reminders
    const [y, m, d] = item.date.split('-').map(Number);
    const itemDate = new Date(y, m - 1, d);
    return isValid(itemDate) && isSameDay(itemDate, tomorrow);
  });

  const handleBatchReminder = () => {
    const bccList = upcomingReminders.map(v => v.email).join(',');
    const subject = "Reminder: Volunteering at Bear Canyon Preschool";
    const body = "Thank you for volunteering at Bear Canyon Preschool! We look forward to hosting you tomorrow. If you can't make it, please email Felima Hohn at fhohn@dcsdk12.org.";
    window.location.href = `mailto:?bcc=${bccList}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-700">Volunteer Dashboard</h2>
          <p className="text-slate-500">Overview of upcoming help and interests</p>
        </div>
        <Button variant="ghost" onClick={onLogout} className="text-slate-500">
          <LogOut size={18} className="mr-2" /> Logout
        </Button>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('schedule')}
          className={`pb-3 px-4 font-medium flex items-center gap-2 transition-colors ${activeTab === 'schedule' ? 'text-violet-600 border-b-2 border-violet-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Calendar size={18} /> Schedule
        </button>
        <button 
          onClick={() => setActiveTab('interests')}
          className={`pb-3 px-4 font-medium flex items-center gap-2 transition-colors ${activeTab === 'interests' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <List size={18} /> Interest Lists
        </button>
      </div>

      {activeTab === 'schedule' && (
        <>
          {upcomingReminders.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4 md:p-6 animate-fade-in shadow-sm">
              <div className="flex flex-col md:flex-row items-start gap-4">
                <div className="bg-white p-3 rounded-full text-amber-500 shadow-sm shrink-0">
                  <Bell size={24} />
                </div>
                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                     <div>
                        <h3 className="text-lg font-bold text-slate-800">Tomorrow's Volunteers ({upcomingReminders.length})</h3>
                        <p className="text-slate-600 text-sm">
                          Volunteers for <strong>{format(tomorrow, 'EEEE, MMMM do')}</strong>.
                        </p>
                     </div>
                     <button 
                       onClick={handleBatchReminder}
                       className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg shadow-md shadow-amber-200 transition-all font-medium"
                     >
                       <Send size={18} />
                       Send All Reminders
                     </button>
                  </div>
                  
                  <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {upcomingReminders.map((vol, idx) => (
                       <div key={`rem-${idx}`} className="bg-white/60 p-2 px-3 rounded-md border border-amber-100 flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${vol.classType === ClassType.AM_3YO ? 'bg-sky-400' : 'bg-rose-400'}`} />
                          <span className="text-sm font-medium text-slate-700">{vol.parentName}</span>
                       </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
             <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 tracking-wider">
                    <th className="p-4">Date</th>
                    <th className="p-4">Time</th>
                    <th className="p-4">Class</th>
                    <th className="p-4">Parent</th>
                    <th className="p-4">Student</th>
                    <th className="p-4">Recurrence</th>
                    <th className="p-4">Email</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {flattenedSchedule.length === 0 ? (
                     <tr><td colSpan={8} className="p-8 text-center text-slate-400">No scheduled volunteers yet.</td></tr>
                  ) : (
                    flattenedSchedule.map((item, idx) => (
                      <tr key={`${item.id}-${item.date}-${idx}`} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-medium text-slate-700">
                           {/* Display pretty date, but fallback to raw string if parsing fails */}
                           {(() => {
                             const [y, m, d] = item.date.split('-').map(Number);
                             const dateObj = new Date(y, m - 1, d);
                             return isValid(dateObj) ? format(dateObj, 'EEE, MMM d, yyyy') : item.date;
                           })()}
                        </td>
                        <td className="p-4 text-slate-600 text-sm whitespace-nowrap">
                          {CLASS_CONFIG[item.classType].time}
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${item.classType === ClassType.AM_3YO ? 'bg-sky-100 text-sky-700' : 'bg-rose-100 text-rose-700'}`}>
                            {item.classType === ClassType.AM_3YO ? 'AM (3yo)' : 'PM (4yo)'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">{item.parentName}</td>
                        <td className="p-4 text-slate-500">{item.studentName}</td>
                        <td className="p-4">
                           {item.isRecurring ? (
                             <span className="flex items-center gap-1 text-violet-600 text-xs font-semibold">
                               Recurring
                             </span>
                           ) : <span className="text-slate-400 text-xs">One-time</span>}
                        </td>
                        <td className="p-4 text-violet-500 underline text-sm">{item.email}</td>
                        <td className="p-4 text-center">
                          <button 
                            type="button"
                            onClick={(e) => handleDeleteSlot(e, item.id, item.date)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete this date"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'interests' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
             <div className="flex items-center gap-2 w-full md:w-auto">
               <div className="relative w-full md:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                   type="text" 
                   placeholder="Search name..." 
                   className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                   value={interestSearch}
                   onChange={e => setInterestSearch(e.target.value)}
                 />
               </div>
             </div>
             
             <div className="flex items-center gap-2 w-full md:w-auto">
               <Filter size={16} className="text-slate-400" />
               <select 
                 className="flex-grow md:flex-none px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
                 value={selectedActivityFilter}
                 onChange={e => setSelectedActivityFilter(e.target.value)}
               >
                 <option value="All">All Activities</option>
                 {ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
                 <option value="Other">Other / Special Skills</option>
               </select>
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
             <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 tracking-wider">
                    <th className="p-4 w-4"></th>
                    <th className="p-4">Parent / Student</th>
                    <th className="p-4">Interests</th>
                    <th className="p-4 min-w-[200px]">Notes</th>
                    <th className="p-4 text-right">Contacted</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {interestVolunteers.length === 0 ? (
                     <tr><td colSpan={6} className="p-8 text-center text-slate-400">No matching records found.</td></tr>
                   ) : (
                     interestVolunteers.map(vol => (
                       <tr key={vol.id} className="hover:bg-slate-50 transition-colors group">
                         <td className="p-4 pr-0 align-top pt-5">
                            <div className={`w-2 h-10 rounded-r-md ${vol.classType === ClassType.AM_3YO ? 'bg-sky-400' : 'bg-rose-400'}`} />
                         </td>
                         <td className="p-4 align-top">
                           <div>
                             <h4 className="font-bold text-slate-700">{vol.parentName}</h4>
                             <p className="text-sm text-slate-500">{vol.studentName}</p>
                             <a href={`mailto:${vol.email}`} className="text-xs text-violet-500 flex items-center gap-1 mt-1 hover:underline">
                               <Mail size={10} /> {vol.email}
                             </a>
                           </div>
                         </td>
                         <td className="p-4 align-top">
                           <div className="flex flex-wrap gap-2">
                              {vol.activityInterests?.map(activity => (
                                <span key={activity} className={`text-xs px-2 py-1 rounded-md border ${selectedActivityFilter === activity ? 'bg-teal-100 text-teal-700 border-teal-200' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                                  {activity}
                                </span>
                              ))}
                           </div>
                           {vol.otherDetails && (
                             <div className="mt-2 text-xs bg-amber-50 text-amber-800 p-2 rounded border border-amber-100 flex gap-2 items-start">
                               <MessageSquareQuote size={12} className="shrink-0 mt-0.5" />
                               <span className="italic">{vol.otherDetails}</span>
                             </div>
                           )}
                         </td>
                         <td className="p-4 align-top">
                           <textarea 
                             className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-400 outline-none bg-slate-50 focus:bg-white transition-all resize-y min-h-[80px]"
                             placeholder="Add internal notes here..."
                             value={vol.adminNotes || ''}
                             onChange={(e) => updateVolunteer(vol.id, { adminNotes: e.target.value })}
                           />
                         </td>
                         <td className="p-4 align-top text-right">
                           <label className="inline-flex flex-col items-center cursor-pointer group">
                             <input 
                               type="checkbox" 
                               className="peer sr-only"
                               checked={!!vol.isContacted}
                               onChange={(e) => updateVolunteer(vol.id, { isContacted: e.target.checked })}
                             />
                             <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500 relative"></div>
                           </label>
                         </td>
                         <td className="p-4 align-top text-center">
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if(confirm('Delete this interest signup?')) deleteVolunteer(vol.id);
                              }}
                              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                         </td>
                       </tr>
                     ))
                   )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};