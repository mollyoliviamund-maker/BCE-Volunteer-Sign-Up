import React, { useState } from 'react';
import { Check, Heart, Lightbulb } from 'lucide-react';
import { ACTIVITIES } from '../constants';
import { ClassType, SignupType, Volunteer } from '../types';
import { Button } from '../components/Button';
import { useVolunteerStore } from '../store/VolunteerContext';
import { generateUUID } from '../utils/dateUtils';

interface ActivitySignupProps {
  classType: ClassType;
  onComplete: () => void;
}

export const ActivitySignup: React.FC<ActivitySignupProps> = ({ classType, onComplete }) => {
  const { addVolunteer } = useVolunteerStore();
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [otherDetails, setOtherDetails] = useState('');
  
  const [formData, setFormData] = useState({
    parentName: '',
    studentName: '',
    email: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev => 
      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedActivities.length === 0 && !isOtherSelected) return;

    // If Other is selected but empty, we can either block or just send it as "Other". 
    // Let's ensure if they checked Other, they at least typed something or we handle it gracefully.
    
    const finalActivities = [...selectedActivities];
    if (isOtherSelected) {
      finalActivities.push('Other');
    }

    const newVolunteer: Volunteer = {
      id: generateUUID(),
      ...formData,
      classType,
      signupType: SignupType.ACTIVITY_INTEREST,
      activityInterests: finalActivities,
      otherDetails: isOtherSelected ? otherDetails : undefined,
      submittedAt: new Date().toISOString()
    };

    addVolunteer(newVolunteer);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-2xl mx-auto border-t-4 border-teal-400 animate-fade-in">
        <div className="w-16 h-16 bg-teal-50 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart size={32} strokeWidth={3} fill="currentColor" className="opacity-20 text-teal-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Thanks for Volunteering!</h2>
        <p className="text-slate-600 mb-8">
          We've added you to our notification list. You'll receive an email at <strong>{formData.email}</strong> when help is needed!
        </p>
        <Button onClick={onComplete} variant="secondary">Return Home</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-lg shadow-teal-100/30 border border-teal-50">
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold text-slate-700 mb-2">What interests you?</h3>
        <p className="text-slate-500">Select as many activities as you like. We will reach out when help is needed.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {ACTIVITIES.map((activity) => (
            <button
              key={activity}
              type="button"
              onClick={() => toggleActivity(activity)}
              className={`
                p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group
                ${selectedActivities.includes(activity) 
                  ? 'border-teal-400 bg-teal-50 text-teal-700' 
                  : 'border-slate-100 bg-white text-slate-500 hover:border-teal-200 hover:text-teal-600'
                }
              `}
            >
              <span className="font-medium">{activity}</span>
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center transition-colors
                ${selectedActivities.includes(activity) ? 'bg-teal-400 text-white' : 'bg-slate-100 text-slate-300 group-hover:bg-slate-200'}
              `}>
                <Check size={14} strokeWidth={3} />
              </div>
            </button>
          ))}

          {/* Other / Special Skills Button */}
          <button
              type="button"
              onClick={() => setIsOtherSelected(!isOtherSelected)}
              className={`
                md:col-span-2 p-4 rounded-xl border-2 text-left transition-all flex items-start md:items-center justify-between group
                ${isOtherSelected 
                  ? 'border-teal-400 bg-teal-50 text-teal-700' 
                  : 'border-slate-100 bg-white text-slate-500 hover:border-teal-200 hover:text-teal-600'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isOtherSelected ? 'bg-teal-100 text-teal-600' : 'bg-slate-50 text-slate-400'}`}>
                   <Lightbulb size={20} />
                </div>
                <div>
                   <span className="font-medium block">Other / Special Skills</span>
                   <span className={`text-sm ${isOtherSelected ? 'text-teal-600/80' : 'text-slate-400'}`}>
                     Presentations, STEM Projects, Music, Hobbies, etc.
                   </span>
                </div>
              </div>
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center transition-colors shrink-0 mt-2 md:mt-0
                ${isOtherSelected ? 'bg-teal-400 text-white' : 'bg-slate-100 text-slate-300 group-hover:bg-slate-200'}
              `}>
                <Check size={14} strokeWidth={3} />
              </div>
            </button>
        </div>

        {/* Other Details Input */}
        {isOtherSelected && (
          <div className="mb-8 animate-fade-in">
             <div className="bg-teal-50/50 p-6 rounded-xl border border-teal-100">
               <label className="block text-sm font-semibold text-teal-800 mb-2">
                 Tell us about your idea!
               </label>
               <p className="text-sm text-slate-500 mb-3">
                 We love when parents share their talents! Whether it's a science experiment, reading a book in another language, playing an instrument, or sharing a family tradition, please describe what you have in mind.
               </p>
               <textarea 
                  required={isOtherSelected}
                  className="w-full px-4 py-3 rounded-lg border border-teal-200 focus:ring-2 focus:ring-teal-300 focus:border-transparent outline-none bg-white min-h-[100px]"
                  placeholder="I work as a geologist and would love to show the kids some cool rocks..."
                  value={otherDetails}
                  onChange={(e) => setOtherDetails(e.target.value)}
               />
             </div>
          </div>
        )}

        <div className="space-y-4 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
          <h4 className="font-semibold text-slate-700 mb-2">Contact Information</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Parent Name</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-300 focus:border-transparent outline-none bg-white"
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
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-300 focus:border-transparent outline-none bg-white"
                placeholder="Student First & Last Name"
                value={formData.studentName}
                onChange={e => setFormData({...formData, studentName: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
              <input 
                required
                type="email" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-300 focus:border-transparent outline-none bg-white"
                placeholder="you@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            variant="secondary"
            className="w-full md:w-auto"
            disabled={(selectedActivities.length === 0 && !isOtherSelected) || !formData.email || !formData.parentName}
          >
            Sign Up for Updates
          </Button>
        </div>
      </form>
    </div>
  );
};