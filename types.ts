
export enum UserRole {
  LEADER = 'LEADER',
  MEMBER = 'MEMBER',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: string; // mobile number for members, specific ID for leader
  name: string;
  mobile: string;
  role: UserRole;
  status: ApprovalStatus;
  rejectionTimestamp?: number;
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  SYSTEM = 'SYSTEM',
  AI = 'AI',
  AUDIO = 'AUDIO',
  AI_IMAGE = 'AI_IMAGE',
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  content: string; // Text, base64 image/audio data, or system message content
  timestamp: number;
}

export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'candidate' | 'hangup';
  from: string;
  to: string;
  data: any;
  id: number;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  timestamp: number;
}
