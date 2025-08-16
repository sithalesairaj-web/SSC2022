
import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

const InstallPWAButton: React.FC = () => {
  const { installPrompt, handleInstallClick } = usePWAInstall();

  if (!installPrompt) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm flex items-center space-x-2"
      aria-label="Install App"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Install</span>
    </button>
  );
};

export default InstallPWAButton;
