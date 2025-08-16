
import React from 'react';
import { User, ApprovalStatus, UserRole } from '../types';

const ApprovalPage: React.FC<{ users: User[], onUpdateUser: (user: User) => void }> = ({ users, onUpdateUser }) => {
    const pendingUsers = users.filter(u => u.status === ApprovalStatus.PENDING);
    const otherUsers = users.filter(u => u.status !== ApprovalStatus.PENDING && u.role !== UserRole.LEADER);

    const handleApprove = (user: User) => {
        onUpdateUser({ ...user, status: ApprovalStatus.APPROVED });
    };

    const handleReject = (user: User) => {
        onUpdateUser({ ...user, status: ApprovalStatus.REJECTED, rejectionTimestamp: Date.now() });
    };
    
    return (
        <div className="p-4 md:p-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Pending Approvals ({pendingUsers.length})</h2>
                {pendingUsers.length === 0 ? <p className="text-gray-500">No pending requests.</p> : (
                    <div className="space-y-4">
                        {pendingUsers.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-700">{user.name}</p>
                                    <p className="text-sm text-gray-500">{user.mobile}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleApprove(user)} className="bg-green-500 text-white px-3 py-1 text-sm rounded-md hover:bg-green-600 transition">Approve</button>
                                    <button onClick={() => handleReject(user)} className="bg-red-500 text-white px-3 py-1 text-sm rounded-md hover:bg-red-600 transition">Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
             <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">All Members ({otherUsers.length})</h2>
                 <div className="space-y-3">
                     {otherUsers.map(user => (
                         <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                             <div>
                                 <p className="font-semibold text-gray-700">{user.name}</p>
                                 <p className="text-sm text-gray-500">{user.mobile}</p>
                             </div>
                             <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                 user.status === ApprovalStatus.APPROVED ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                             }`}>
                                 {user.status}
                             </span>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    );
};

export default ApprovalPage;
