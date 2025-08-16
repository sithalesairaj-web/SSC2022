import React, { useState } from 'react';
import { User, UserRole, ApprovalStatus } from '../types';
import { storageService } from '../services/storageService';
import { LEADER_ID, LEADER_PW, MEMBER_PW, REJECTION_COOLDOWN_HOURS } from '../constants';

const LoginPage: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLeaderLogin, setIsLeaderLogin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLeaderLogin) {
      if (name === LEADER_ID && password === LEADER_PW) {
        const leader = storageService.getUserById(LEADER_ID);
        if (leader) onLogin(leader);
      } else {
        setError("Wrong password entered. Please contact: Sairaj App Leader");
      }
      return;
    }

    const existingUser = storageService.getUserById(mobile);

    if (isRegister) {
      if(existingUser) {
        if(existingUser.status === ApprovalStatus.REJECTED && existingUser.rejectionTimestamp) {
            const cooldownMs = REJECTION_COOLDOWN_HOURS * 60 * 60 * 1000;
            if(Date.now() - existingUser.rejectionTimestamp < cooldownMs) {
                setError(`You were recently rejected. Please wait ${REJECTION_COOLDOWN_HOURS} hours before trying again.`);
                return;
            }
        } else if (existingUser.status !== ApprovalStatus.REJECTED) {
            setError("This mobile number is already registered or pending approval.");
            return;
        }
      }

      const newUser: User = { id: mobile, name, mobile, role: UserRole.MEMBER, status: ApprovalStatus.PENDING };
      storageService.saveUser(newUser);
      alert("Registration successful! Your account is pending approval from the group leader.");
      setIsRegister(false);
    } else { // Login
      if (existingUser && password === MEMBER_PW) {
        onLogin(existingUser);
      } else {
        setError("Wrong password entered. Please contact: Sairaj App Leader");
      }
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 p-4">
        <div className="w-full max-w-md space-y-6">
            <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">SSC BATCH 2022</h1>
                    <p className="text-gray-500">Private Group Portal</p>
                </div>

                <div className="flex border border-gray-200 rounded-lg p-1">
                    <button onClick={() => { setIsLeaderLogin(false); setError(''); }} className={`w-1/2 p-2 rounded-md font-semibold transition-all ${!isLeaderLogin ? 'bg-blue-500 text-white shadow' : 'bg-transparent text-gray-600'}`}>Member</button>
                    <button onClick={() => { setIsLeaderLogin(true); setError(''); }} className={`w-1/2 p-2 rounded-md font-semibold transition-all ${isLeaderLogin ? 'bg-blue-500 text-white shadow' : 'bg-transparent text-gray-600'}`}>Leader</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{error}</p>}
                    
                    {isLeaderLogin ? (
                        <>
                        <input type="text" placeholder="Leader User ID" value={name} onChange={e => setName(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"/>
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"/>
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 transition-colors">Login as Leader</button>
                        </>
                    ) : (
                        <>
                        <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"/>
                        {!isRegister && <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"/>}
                        <input type="tel" placeholder="Mobile Number" value={mobile} onChange={e => setMobile(e.target.value)} required pattern="[0-9]{10}" title="Please enter a 10-digit mobile number" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"/>
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 transition-colors">{isRegister ? 'Register' : 'Login'}</button>
                        <p className="text-center text-sm text-gray-600">
                            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button type="button" onClick={() => setIsRegister(!isRegister)} className="font-semibold text-blue-600 hover:underline">
                            {isRegister ? 'Login' : 'Register Now'}
                            </button>
                        </p>
                        </>
                    )}
                </form>
            </div>
             <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-6 text-sm text-gray-700 shadow-lg">
                <div className="text-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <h3 className="font-bold text-lg mt-2 text-gray-800">Get the App Experience!</h3>
                </div>
                <p className="text-center text-gray-600">
                    For the best experience, install this app on your phone's home screen. It works offline and feels just like a native app.
                </p>
                <p className="mt-3 text-center text-xs text-gray-500">
                    Look for the 'Install' button in the header after you log in, or use the 'Add to Home Screen' option in your browser menu.
                </p>
            </div>
        </div>
      </div>
  );
};

export default LoginPage;
