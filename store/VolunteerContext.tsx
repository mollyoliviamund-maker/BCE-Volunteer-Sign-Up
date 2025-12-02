import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { Volunteer, ClassType, SignupType } from '../types';
import { GOOGLE_SCRIPT_URL } from '../constants';

interface VolunteerContextType {
  volunteers: Volunteer[];
  addVolunteer: (volunteer: Volunteer) => void;
  updateVolunteer: (id: string, updates: Partial<Volunteer>) => void;
  deleteVolunteer: (id: string, date?: string) => void;
  setVolunteers: (volunteers: Volunteer[]) => void;
  loading: boolean;
}

const VolunteerContext = createContext<VolunteerContextType | undefined>(undefined);

const STORAGE_KEY = 'bear_canyon_volunteers_2025_2026_v5';

export const VolunteerProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Load from LocalStorage
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setVolunteers(JSON.parse(storedData));
      } else if (!GOOGLE_SCRIPT_URL) {
        setVolunteers([]);
      }
    } catch (e) {
      console.warn('LocalStorage load error', e);
    }
    setLoading(false);
  }, []);

  // 2. Fetch from Google Sheets
  useEffect(() => {
    if (!GOOGLE_SCRIPT_URL) return;

    const fetchFromSheet = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?t=${timestamp}`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          // Sanitize dates just in case (remove 'T...' time parts or leading apostrophes or spaces)
          const cleanData = data.map((v: any) => ({
            ...v,
            dates: (v.dates || []).map((d: string) => {
              // The backend V9 sends plain strings, but we double clean to be safe
              let clean = d.replace(/'/g, "").trim(); 
              if (clean.includes('T')) clean = clean.split('T')[0];
              return clean;
            })
          }));
          
          setVolunteers(cleanData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData));
        }
      } catch (error) {
        console.error('Failed to fetch from Google Sheet:', error);
      }
    };

    fetchFromSheet();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(volunteers));
  }, [volunteers]);

  // Actions
  const addVolunteer = (volunteer: Volunteer) => {
    setVolunteers(prev => [...prev, volunteer]);

    if (GOOGLE_SCRIPT_URL) {
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'CREATE', payload: volunteer })
      }).catch(err => console.error("Failed to sync add", err));
    }
  };

  const updateVolunteer = (id: string, updates: Partial<Volunteer>) => {
    setVolunteers(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));

    if (GOOGLE_SCRIPT_URL) {
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'UPDATE', payload: { id, ...updates } })
      }).catch(err => console.error("Failed to sync update", err));
    }
  };

  const deleteVolunteer = (id: string, date?: string) => {
    // Ensure we are working with a clean date string
    const targetDate = date ? date.trim() : undefined;
    console.log("Delete Request Initiated for:", { id, targetDate });

    // Optimistic Update
    setVolunteers(prev => {
      if (targetDate) {
        // Remove just this date from the volunteer
        return prev.map(v => {
          if (v.id === id && v.dates) {
            // SAFE MATCHING: Use includes() or loosen check to handle minor format diffs
            const newDates = v.dates.filter(d => !d.includes(targetDate));
            if (newDates.length === 0) return null; // Remove vol if no dates left
            return { ...v, dates: newDates };
          }
          return v;
        }).filter((v): v is Volunteer => v !== null);
      } else {
        // Remove entire volunteer record
        return prev.filter(v => v.id !== id);
      }
    });

    // Send to Backend
    if (GOOGLE_SCRIPT_URL) {
      // Create payload. If deleting a whole record, date should be empty string (not undefined) for safety
      const payload = { id, date: targetDate || "" };
      
      console.log('Syncing DELETE to backend:', payload);
      
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'DELETE', payload })
      }).catch(err => console.error("Failed to sync delete", err));
    }
  };

  return (
    <VolunteerContext.Provider value={{ volunteers, addVolunteer, updateVolunteer, deleteVolunteer, setVolunteers, loading }}>
      {children}
    </VolunteerContext.Provider>
  );
};

export const useVolunteerStore = () => {
  const context = useContext(VolunteerContext);
  if (!context) {
    throw new Error('useVolunteerStore must be used within a VolunteerProvider');
  }
  return context;
};