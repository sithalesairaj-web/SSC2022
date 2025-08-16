
import React from 'react';
import { User, ApprovalStatus } from '../types';
import { REJECTION_COOLDOWN_HOURS } from '../constants';

const StatusPage: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
    let title = "Status: Pending Approval";
    let message = "Your account registration is currently being reviewed by the group leader. You will be able to access the chat once approved.";
    let color = "blue";

    if (user.status === ApprovalStatus.REJECTED) {
        title = "Status: Registration Rejected";
        message = `Your registration was rejected by the group leader. You can try to register again after ${REJECTION_COOLDOWN_HOURS} hours.`;
        if (user.rejectionTimestamp) {
            const cooldownMs = REJECTION_COOLDOWN_HOURS * 60 * 60 * 1000;
            const remainingMs = (user.rejectionTimestamp + cooldownMs) - Date.now();
            if (remainingMs > 0) {
                const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
                message = `Your registration was rejected. You can try again in approximately ${remainingHours} hour(s).`;
            }
        }
        color = "red";
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
            <div className={`w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center border-t-4 border-${color}-500`}>
                <h1 className={`text-2xl font-bold text-gray-800 mb-2`}>{title}</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <button
                    onClick={onLogout}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default StatusPage;
