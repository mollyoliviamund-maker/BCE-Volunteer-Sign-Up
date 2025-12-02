import React, { useState } from 'react';
import { Calendar, Bell, Users, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { SelectionCard } from '../components/SelectionCard';
import { ClassType, SignupType } from '../types';
import { CLASS_CONFIG } from '../constants';
import { CalendarScheduler } from './CalendarScheduler';
import { ActivitySignup } from './ActivitySignup';

export const Wizard: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const [signupType, setSignupType] = useState<SignupType | null>(null);
  const [classType, setClassType] = useState<ClassType | null>(null);

  const reset = () => {
    setStep(0);
    setSignupType(null);
    setClassType(null);
  };

  const handleTypeSelection = (type: SignupType) => {
    setSignupType(type);
    setStep(1);
  };

  const handleClassSelection = (type: ClassType) => {
    setClassType(type);
    setStep(2);
  };

  const goBack = () => {
    if (step === 1) {
      setStep(0);
      setSignupType(null);
    } else if (step === 2) {
      setStep(1);
      setClassType(null);
    }
  };

  // Step 0: Choose Path (Time vs Activity)
  if (step === 0) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-slate-700">Thank you for being willing to volunteer at Bear Canyon Preschool!</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            We appreciate your interest! Please choose how you would like to participate below.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <SelectionCard
            title="Sign up for a Time Slot(s)"
            description="We invite you to join us in the classroom! Feel free to sign up for a single visit or a recurring weekly time slot that works best for your schedule."
            icon={Calendar}
            onClick={() => handleTypeSelection(SignupType.TIME_SLOT)}
            iconColorClass="bg-violet-100 text-violet-600"
            colorClass="bg-white hover:border-violet-200"
          />
          <SelectionCard
            title="Sign up for Activities"
            description="Select the types of activities you would like to support, such as class parties or crafts. We will send you an email notification when help is needed for these events."
            icon={Bell}
            onClick={() => handleTypeSelection(SignupType.ACTIVITY_INTEREST)}
            iconColorClass="bg-emerald-100 text-emerald-600"
            colorClass="bg-white hover:border-emerald-200"
          />
        </div>
      </div>
    );
  }

  // Step 1: Choose Class (AM vs PM)
  if (step === 1) {
    return (
      <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
        <Button variant="ghost" onClick={goBack} className="mb-4 pl-0 hover:bg-transparent text-slate-500 hover:text-slate-700">
          <ArrowLeft className="mr-2" size={20} /> Back
        </Button>

        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-bold text-slate-700">Which class does your child attend?</h2>
          <p className="text-slate-500">This ensures you see the correct schedule and times.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <SelectionCard
            title="3 Year Olds (AM)"
            description="Monday - Thursday | 8:30 AM - 11:10 AM"
            icon={Users}
            onClick={() => handleClassSelection(ClassType.AM_3YO)}
            iconColorClass="bg-sky-100 text-sky-600"
            colorClass="bg-white hover:border-sky-200"
          />
          <SelectionCard
            title="4 Year Olds (PM)"
            description="Monday - Friday | 12:30 PM - 3:30 PM"
            icon={Users}
            onClick={() => handleClassSelection(ClassType.PM_4YO)}
            iconColorClass="bg-rose-100 text-rose-500"
            colorClass="bg-white hover:border-rose-200"
          />
        </div>
      </div>
    );
  }

  // Step 2: The Logic (Scheduler or Activity Form)
  if (step === 2 && classType && signupType) {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
           <Button variant="ghost" onClick={goBack} className="pl-0 hover:bg-transparent text-slate-500 hover:text-slate-700">
            <ArrowLeft className="mr-2" size={20} /> Back
          </Button>
          <div className="text-right">
             <span className="block text-sm text-slate-400">Selected Class</span>
             <span className="font-semibold text-slate-700">{CLASS_CONFIG[classType].name}</span>
          </div>
        </div>

        {signupType === SignupType.TIME_SLOT ? (
          <CalendarScheduler classType={classType} onComplete={reset} />
        ) : (
          <ActivitySignup classType={classType} onComplete={reset} />
        )}
      </div>
    );
  }

  return null;
};