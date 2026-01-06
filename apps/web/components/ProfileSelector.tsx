'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Plus, User } from 'lucide-react';
import { profileApi } from '@/lib/api';

interface Profile {
  id: number;
  name: string;
  is_active: boolean;
  has_resume: boolean;
}

interface ProfileSelectorProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCreateNew?: () => void;
}

export default function ProfileSelector({ selectedId, onSelect, onCreateNew }: ProfileSelectorProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfiles = async () => {
    try {
      const response = await profileApi.list();
      if (response.success) {
        const profileData = (response.data || []) as Profile[];
        setProfiles(profileData);
        // Auto-select first profile if none selected
        if (!selectedId && profileData.length > 0) {
          onSelect(profileData[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load profiles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProfile = profiles.find((p) => p.id === selectedId);

  if (isLoading) {
    return (
      <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-background hover:bg-muted transition-colors min-w-[200px]"
      >
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 text-left truncate">
          {selectedProfile?.name || 'Select Profile'}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-full bg-background border rounded-lg shadow-lg z-20 py-1">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => {
                  onSelect(profile.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center gap-2 ${
                  profile.id === selectedId ? 'bg-muted' : ''
                }`}
              >
                <span className="flex-1">{profile.name}</span>
                {!profile.has_resume && (
                  <span className="text-xs text-muted-foreground">(No resume)</span>
                )}
              </button>
            ))}
            {onCreateNew && (
              <>
                <div className="border-t my-1" />
                <button
                  onClick={() => {
                    onCreateNew();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-muted transition-colors flex items-center gap-2 text-primary"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New Profile</span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
