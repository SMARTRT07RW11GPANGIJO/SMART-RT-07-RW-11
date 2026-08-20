import React from 'react';
import { AIAgentDashboard } from '../components/ai/AIAgentDashboard';
import { UserRole } from '../types/rt';

interface AIAssistantPageProps {
  currentRole: UserRole;
  userName?: string;
  addToast?: (type: 'success' | 'error' | 'info' | 'loading', title: string, message?: string) => void;
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({
  currentRole,
  userName = 'Warga RT 07',
  addToast
}) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AIAgentDashboard
        currentRole={currentRole}
        currentUserName={userName}
      />
    </div>
  );
};

