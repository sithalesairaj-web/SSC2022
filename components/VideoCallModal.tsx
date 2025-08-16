
import React, { useState, useEffect, useRef } from 'react';
import { VideoOnIcon, VideoOffIcon, MicOnIcon, MicOffIcon, CallEndIcon } from './Icons';

const VideoCallModal: React.FC<{
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    inCall: boolean;
    incomingCall: { from: string } | null;
    answerCall: () => void;
    hangUp: () => void;
    toggleMute: () => void;
    toggleVideo: () => void;
}> = ({ localStream, remoteStream, inCall, incomingCall, answerCall, hangUp, toggleMute, toggleVideo }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
    }, [remoteStream]);
    
    const handleToggleMute = () => {
        toggleMute();
        setIsMuted(!isMuted);
    };

    const handleToggleVideo = () => {
        toggleVideo();
        setIsVideoOff(!isVideoOff);
    };
    
    if (!inCall && !incomingCall) return null;

    if (incomingCall && !inCall) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="incoming-call-title">
                <div className="bg-white rounded-lg p-8 text-center shadow-xl">
                    <h2 id="incoming-call-title" className="text-2xl font-bold mb-2">Incoming Call</h2>
                    <p className="text-gray-600 mb-6">You have an incoming video call from {incomingCall.from}.</p>
                    <div className="flex justify-center space-x-4">
                        <button onClick={answerCall} className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600">Answer</button>
                        <button onClick={hangUp} className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600">Decline</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Video call">
            <div className="relative w-full h-full flex flex-col md:flex-row gap-4">
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain bg-gray-900 rounded-lg" aria-label="Remote user's video" />
                <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-4 right-4 w-1/4 max-w-[200px] h-auto border-2 border-white rounded-lg" aria-label="Your video preview" />
            </div>
            <div className="absolute bottom-10 flex items-center space-x-4 bg-gray-800 bg-opacity-50 p-3 rounded-full">
                <button onClick={handleToggleMute} className="p-3 bg-white rounded-full" aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}>
                    {isMuted ? <MicOffIcon className="w-6 h-6 text-gray-800" /> : <MicOnIcon className="w-6 h-6 text-gray-800" />}
                </button>
                <button onClick={handleToggleVideo} className="p-3 bg-white rounded-full" aria-label={isVideoOff ? "Turn on video" : "Turn off video"}>
                    {isVideoOff ? <VideoOffIcon className="w-6 h-6 text-gray-800" /> : <VideoOnIcon className="w-6 h-6 text-gray-800" />}
                </button>
                <button onClick={hangUp} className="p-4 bg-red-500 rounded-full" aria-label="End call">
                    <CallEndIcon className="w-8 h-8 text-white" />
                </button>
            </div>
        </div>
    );
};

export default VideoCallModal;
