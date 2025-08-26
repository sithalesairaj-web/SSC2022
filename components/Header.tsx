import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole } from '../types';
import { LeaderBadgeIcon, DownloadIcon, ShareIcon, MoreVertIcon } from './Icons';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  currentView: string;
  onSetView: (view: 'chat' | 'approval') => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, currentView, onSetView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { installPrompt, handleInstallClick } = usePWAInstall();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleShare = async () => {
    const shareData = {
      title: 'SSC BATCH 2022 App',
      text: 'Join our private group chat! Created by Sairaj.',
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard! You can now share it with your friends.');
      } catch (err) {
        alert('Could not copy link. Please manually copy the URL from your browser.');
        console.error('Could not copy text: ', err);
      }
    }
  };


  return (
    <>
      <header className="bg-white shadow-md p-3 sticky top-0 z-40">
        <div className="flex justify-between items-center max-w-5xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-md font-bold text-gray-800 flex items-center">
                {user.name}
                {user.role === UserRole.LEADER && <LeaderBadgeIcon className="w-5 h-5 ml-1 text-blue-500" />}
              </h1>
              <p className="text-xs text-gray-500">{user.role === UserRole.LEADER ? 'Group Leader' : 'Group Member'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-3">
            {user.role === UserRole.LEADER && (
              <div className="flex bg-slate-200 rounded-lg p-1">
                <button
                  onClick={() => onSetView('chat')}
                  className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${currentView === 'chat' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}
                >
                  Chat
                </button>
                <button
                  onClick={() => onSetView('approval')}
                  className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${currentView === 'approval' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}
                >
                  Approvals
                </button>
              </div>
            )}
            {installPrompt && (
              <button
                onClick={handleInstallClick}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm flex items-center space-x-2"
                aria-label="Install App"
              >
                <DownloadIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Install</span>
              </button>
            )}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="More options"
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
              >
                <MoreVertIcon className="w-6 h-6 text-gray-600" />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                  <button
                    onClick={() => { handleShare(); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-slate-100 flex items-center space-x-3"
                  >
                    <ShareIcon className="w-5 h-5 text-gray-500" />
                    <span>Share App</span>
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
