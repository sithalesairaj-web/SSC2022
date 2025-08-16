
import React, { useState, useEffect } from 'react';
import { storageService } from './services/storageService';
import { User, Message, MessageType, ApprovalStatus, UserRole } from './types';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import ChatPage from './components/ChatPage';
import ApprovalPage from './components/ApprovalPage';
import StatusPage from './components/StatusPage';
import Watermark from './components/Watermark';
import { useWebRTC } from './hooks/useWebRTC';
import VideoCallModal from './components/VideoCallModal';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(storageService.getCurrentUser());
  const [users, setUsers] = useState<User[]>(storageService.getUsers());
  const [messages, setMessages] = useState<Message[]>(storageService.getMessages());
  const [currentView, setCurrentView] = useState<'chat' | 'approval'>('chat');

  const { localStream, remoteStream, inCall, incomingCall, startCall, answerCall, hangUp, toggleMute, toggleVideo } = useWebRTC(currentUser?.id ?? null);
  
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = storageService.getCurrentUser();
      // Deep comparison is expensive, simple JSON stringify works for this object structure
      if (JSON.stringify(updatedUser) !== JSON.stringify(currentUser)) {
          setCurrentUser(updatedUser);
      }
      setUsers(storageService.getUsers());
      setMessages(storageService.getMessages());
    };

    // Poll for changes to ensure UI is synchronized across tabs
    const interval = setInterval(handleStorageChange, 1000);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser]);

  const handleLogin = (user: User) => {
    storageService.setCurrentUser(user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    if (inCall) {
        hangUp();
    }
    storageService.setCurrentUser(null);
    setCurrentUser(null);
  };

  const handleUpdateUser = (user: User) => {
    storageService.updateUser(user);
    setUsers(storageService.getUsers());
  };

  const handleAddMessage = (message: Message) => {
    storageService.addMessage(message);
    setMessages(storageService.getMessages());
  };
  
  const handleSetView = (view: 'chat' | 'approval') => {
    setCurrentView(view);
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentUser.status !== ApprovalStatus.APPROVED) {
    return <StatusPage user={currentUser} onLogout={handleLogout} />;
  }

  const callerName = incomingCall ? storageService.getUserById(incomingCall.from)?.name || 'Unknown User' : null;

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans antialiased">
        <Header user={currentUser} onLogout={handleLogout} currentView={currentView} onSetView={handleSetView} />
        <main className="flex-1 overflow-y-hidden">
            {currentView === 'chat' || currentUser.role !== UserRole.LEADER ? (
                <ChatPage user={currentUser} users={users} messages={messages} onAddMessage={handleAddMessage} onStartCall={startCall} />
            ) : (
                <ApprovalPage users={users} onUpdateUser={handleUpdateUser} />
            )}
        </main>
        <Watermark />
        <VideoCallModal 
            localStream={localStream}
            remoteStream={remoteStream}
            inCall={inCall}
            incomingCall={incomingCall && callerName ? { from: callerName } : null}
            answerCall={answerCall}
            hangUp={hangUp}
            toggleMute={toggleMute}
            toggleVideo={toggleVideo}
        />
    </div>
  );
};

export default App;