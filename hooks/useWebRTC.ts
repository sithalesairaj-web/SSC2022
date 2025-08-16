
import { useState, useEffect, useCallback, useRef } from 'react';
import { storageService } from '../services/storageService';
import { WebRTCSignal } from '../types';

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const useWebRTC = (userId: string | null) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [inCall, setInCall] = useState(false);
  const [caller, setCaller] = useState<string | null>(null);
  const [callee, setCallee] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState<WebRTCSignal | null>(null);
  const lastSignalId = useRef<number>(0);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(STUN_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && userId && callee) {
        storageService.sendSignal({
          type: 'candidate',
          from: userId,
          to: callee,
          data: event.candidate,
          id: Date.now()
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };
    
    return pc;
  }, [userId, callee]);
  

  const initializeStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Error accessing media devices.", error);
      alert("Could not access camera or microphone. Please check permissions.");
      return null;
    }
  }, []);

  const handleSignal = useCallback(async (signal: WebRTCSignal) => {
    if (!userId || signal.id <= lastSignalId.current) return;
    lastSignalId.current = signal.id;
    
    let pc = peerConnection;

    if (signal.type === 'offer' && signal.to === userId && !inCall) {
      setIncomingCall(signal);
      setCallee(signal.from); // Callee is the one who sent the offer
    } else if (signal.type === 'answer' && signal.to === userId && pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
    } else if (signal.type === 'candidate' && signal.to === userId && pc) {
      await pc.addIceCandidate(new RTCIceCandidate(signal.data));
    } else if (signal.type === 'hangup' && (signal.to === userId || signal.from === userId)) {
      hangUp();
    }
  }, [userId, inCall, peerConnection]);


  useEffect(() => {
    const pollInterval = setInterval(() => {
      const signal = storageService.readSignal();
      if (signal) {
        handleSignal(signal);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [handleSignal]);

  const startCall = useCallback(async (targetUserId: string) => {
    if (!userId) return;
    const stream = await initializeStream();
    if (!stream) return;

    const pc = createPeerConnection();
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    
    setPeerConnection(pc);
    setInCall(true);
    setCaller(userId);
    setCallee(targetUserId);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    storageService.sendSignal({
      type: 'offer',
      from: userId,
      to: targetUserId,
      data: offer,
      id: Date.now(),
    });
  }, [userId, initializeStream, createPeerConnection]);

  const answerCall = useCallback(async () => {
    if (!userId || !incomingCall) return;
    
    const stream = await initializeStream();
    if (!stream) return;

    const pc = createPeerConnection();
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    setPeerConnection(pc);
    await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.data));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    storageService.sendSignal({
      type: 'answer',
      from: userId,
      to: incomingCall.from,
      data: answer,
      id: Date.now(),
    });

    setInCall(true);
    setCaller(incomingCall.from);
    setCallee(userId);
    setIncomingCall(null);
  }, [userId, incomingCall, initializeStream, createPeerConnection]);


  const hangUp = useCallback(() => {
    if(peerConnection) {
        peerConnection.close();
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    if (userId && (caller || callee)) {
      storageService.sendSignal({
          type: 'hangup',
          from: userId,
          to: caller === userId ? callee! : caller!,
          data: null,
          id: Date.now(),
      });
    }

    setPeerConnection(null);
    setLocalStream(null);
    setRemoteStream(null);
    setInCall(false);
    setIncomingCall(null);
    setCaller(null);
    setCallee(null);
    lastSignalId.current = 0;
    // Clear the signal to prevent re-triggering
    setTimeout(() => storageService.sendSignal({} as any), 500);

  }, [peerConnection, localStream, userId, caller, callee]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }
  };


  return {
    localStream,
    remoteStream,
    inCall,
    incomingCall,
    startCall,
    answerCall,
    hangUp,
    toggleMute,
    toggleVideo
  };
};
