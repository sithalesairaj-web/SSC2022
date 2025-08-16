
import { User, Message, WebRTCSignal, UserRole, ApprovalStatus } from '../types';
import { LOCAL_STORAGE_KEYS, LEADER_ID } from '../constants';

class StorageService {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) {
      const leader: User = {
        id: LEADER_ID,
        name: 'Sairaj - Leader',
        mobile: '0000000000',
        role: UserRole.LEADER,
        status: ApprovalStatus.APPROVED,
      };
      localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify([leader]));
    }
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.MESSAGES)) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.MESSAGES, JSON.stringify([]));
    }
  }

  // User Management
  getUsers(): User[] {
    const usersJson = localStorage.getItem(LOCAL_STORAGE_KEYS.USERS);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  saveUser(user: User): void {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex > -1) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(users));
  }
  
  updateUser(user: User): void {
      this.saveUser(user);
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === user.id) {
          this.setCurrentUser(user);
      }
  }

  // Current User Session
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    }
  }

  // Message Management
  getMessages(): Message[] {
    const messagesJson = localStorage.getItem(LOCAL_STORAGE_KEYS.MESSAGES);
    return messagesJson ? JSON.parse(messagesJson) : [];
  }

  addMessage(message: Message): void {
    const messages = this.getMessages();
    messages.push(message);
    localStorage.setItem(LOCAL_STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }

  // WebRTC Signaling
  sendSignal(signal: WebRTCSignal): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.WEBRTC_SIGNAL, JSON.stringify(signal));
  }

  readSignal(): WebRTCSignal | null {
    const signalJson = localStorage.getItem(LOCAL_STORAGE_KEYS.WEBRTC_SIGNAL);
    return signalJson ? JSON.parse(signalJson) : null;
  }
}

export const storageService = new StorageService();
