
import React, { useState, useEffect, useRef } from 'react';
import { User, Message, ApprovalStatus, MessageType } from '../types';
import { MAX_IMAGE_SIZE_MB, AI_SENDER_ID, AI_SENDER_NAME } from '../constants';
import { SendIcon, AttachmentIcon, CallIcon, AiIcon, MicOnIcon, StopIcon, ImageIcon } from './Icons';
import { GoogleGenAI } from '@google/genai';

// Helper to format time
const formatTime = (timestamp: number) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const ChatPage: React.FC<{ 
    user: User; 
    users: User[];
    messages: Message[];
    onAddMessage: (message: Message) => void;
    onStartCall: (userId: string) => void;
}> = ({ user, users, messages, onAddMessage, onStartCall }) => {
    const [text, setText] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isImageGenerating, setIsImageGenerating] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const approvedUsers = users.filter(u => u.status === ApprovalStatus.APPROVED);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (text.trim() && user) {
            const newMessage: Message = {
              id: `${Date.now()}-${Math.random()}`,
              senderId: user.id,
              senderName: user.name,
              type: MessageType.TEXT,
              content: text.trim(),
              timestamp: Date.now(),
            };
            onAddMessage(newMessage);
            setText('');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
                alert(`File is too large. Max size is ${MAX_IMAGE_SIZE_MB}MB.`);
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                if(event.target?.result && user) {
                    const newMessage: Message = {
                      id: `${Date.now()}-${Math.random()}`,
                      senderId: user.id,
                      senderName: user.name,
                      type: MessageType.IMAGE,
                      content: event.target.result as string,
                      timestamp: Date.now(),
                    };
                    onAddMessage(newMessage);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleAskAi = async () => {
        const prompt = text.trim();
        if (!prompt || !user) return;

        setIsAiLoading(true);

        const userMessage: Message = {
            id: `${Date.now()}-${Math.random()}`,
            senderId: user.id,
            senderName: user.name,
            type: MessageType.TEXT,
            content: prompt,
            timestamp: Date.now(),
        };
        onAddMessage(userMessage);
        setText('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            const aiResponseText = response.text;
            
            const aiMessage: Message = {
                id: `${Date.now()}-${Math.random()}`,
                senderId: AI_SENDER_ID,
                senderName: AI_SENDER_NAME,
                type: MessageType.AI,
                content: aiResponseText,
                timestamp: Date.now(),
            };
            onAddMessage(aiMessage);

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            const errorMessage: Message = {
                 id: `${Date.now()}-${Math.random()}`,
                senderId: AI_SENDER_ID,
                senderName: AI_SENDER_NAME,
                type: MessageType.AI,
                content: "Sorry, I couldn't process that request. Please try again later.",
                timestamp: Date.now(),
            };
            onAddMessage(errorMessage);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleGenerateImage = async () => {
        const prompt = text.trim();
        if (!prompt || !user) return;
    
        setIsImageGenerating(true);
    
        const userMessage: Message = {
            id: `${Date.now()}-${Math.random()}`,
            senderId: user.id,
            senderName: user.name,
            type: MessageType.TEXT,
            content: `(Image Prompt) ${prompt}`,
            timestamp: Date.now(),
        };
        onAddMessage(userMessage);
        setText('');
    
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                },
            });
    
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
    
            const aiImageMessage: Message = {
                id: `${Date.now()}-${Math.random()}`,
                senderId: AI_SENDER_ID,
                senderName: AI_SENDER_NAME,
                type: MessageType.AI_IMAGE,
                content: imageUrl,
                timestamp: Date.now(),
            };
            onAddMessage(aiImageMessage);
    
        } catch (error) {
            console.error("Error calling Gemini Image API:", error);
            const errorMessage: Message = {
                id: `${Date.now()}-${Math.random()}`,
                senderId: AI_SENDER_ID,
                senderName: AI_SENDER_NAME,
                type: MessageType.AI,
                content: "Sorry, I couldn't generate that image. The prompt might be unsafe or the service is unavailable.",
                timestamp: Date.now(),
            };
            onAddMessage(errorMessage);
        } finally {
            setIsImageGenerating(false);
        }
    };

    const handleToggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) audioChunksRef.current.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = () => {
                        if (reader.result && user) {
                            const newMessage: Message = {
                                id: `${Date.now()}-${Math.random()}`,
                                senderId: user.id,
                                senderName: user.name,
                                type: MessageType.AUDIO,
                                content: reader.result as string,
                                timestamp: Date.now(),
                            };
                            onAddMessage(newMessage);
                        }
                    };
                    stream.getTracks().forEach(track => track.stop());
                    setIsRecording(false);
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Failed to start recording", err);
                alert("Could not access microphone. Please check permissions.");
            }
        }
    };
    
    const getPlaceholderText = () => {
        if (isAiLoading) return "AI is thinking...";
        if (isImageGenerating) return "AI is creating an image...";
        if (isRecording) return "Recording audio...";
        return "Type a message or an image prompt...";
    };

    const getActionButtonLabel = () => {
        if (isRecording) return "Stop recording";
        if (text.trim()) return "Send message";
        return "Start recording voice message";
    };

    const isInputDisabled = isAiLoading || isRecording || isImageGenerating;

    return (
        <div className="flex h-full max-w-7xl mx-auto">
            {/* User List Panel */}
            <div className="w-1/3 md:w-1/4 bg-white border-r border-gray-200 flex flex-col">
                <h2 className="p-4 font-bold text-lg text-gray-800 border-b">Members ({approvedUsers.length})</h2>
                <div className="overflow-y-auto flex-1">
                    {approvedUsers.map(u => (
                        <div key={u.id} className="flex items-center justify-between p-3 hover:bg-slate-100 transition-colors">
                            <span className="font-semibold text-gray-700">{u.name}</span>
                            {u.id !== user.id && (
                                <button onClick={() => onStartCall(u.id)} className="text-blue-500 hover:text-blue-700 p-1 rounded-full" aria-label={`Call ${u.name}`}>
                                    <CallIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="w-2/3 md:w-3/4 flex flex-col bg-slate-50">
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                    {messages.map(msg => {
                         if (msg.type === MessageType.AI) {
                            return (
                                <div key={msg.id} className="flex justify-start">
                                    <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 text-white shadow-lg">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-bold text-sm flex items-center">
                                                <AiIcon className="w-5 h-5 mr-2" />
                                                {msg.senderName}
                                            </p>
                                            <p className="text-xs opacity-75 ml-2">{formatTime(msg.timestamp)}</p>
                                        </div>
                                        <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            );
                        }
                        if (msg.type === MessageType.AI_IMAGE) {
                            return (
                                <div key={msg.id} className="flex justify-start">
                                    <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 text-white shadow-lg">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-bold text-sm flex items-center">
                                                <AiIcon className="w-5 h-5 mr-2" />
                                                {msg.senderName}
                                            </p>
                                            <p className="text-xs opacity-75 ml-2">{formatTime(msg.timestamp)}</p>
                                        </div>
                                        <img src={msg.content} alt="AI generated content" className="rounded-lg mt-1 max-w-full h-auto" />
                                    </div>
                                </div>
                            );
                        }
                        return (
                           <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.senderId === user.id ? 'bg-blue-500 text-white' : 'bg-white shadow'}`}>
                                    <div className="flex items-baseline justify-between mb-1">
                                        <p className="font-bold text-sm">{msg.senderName}</p>
                                        <p className="text-xs opacity-75 ml-2">{formatTime(msg.timestamp)}</p>
                                    </div>
                                    {msg.type === MessageType.TEXT && <p className="text-sm break-words">{msg.content}</p>}
                                    {msg.type === MessageType.IMAGE && <img src={msg.content} alt="shared content" className="rounded-lg mt-1 max-w-full h-auto" />}
                                    {msg.type === MessageType.AUDIO && (
                                        <audio controls src={msg.content} className="w-full max-w-[250px] mt-1 h-10">
                                            Your browser does not support the audio element.
                                        </audio>
                                     )}
                                    {msg.type === MessageType.SYSTEM && <p className="text-xs italic text-center text-gray-500">{msg.content}</p>}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                        <input type="file" accept="image/png, image/jpeg, image/gif" ref={imageInputRef} onChange={handleImageUpload} className="hidden" id="image-upload" disabled={isInputDisabled} />
                        <button onClick={() => imageInputRef.current?.click()} className="p-2 text-gray-500 hover:text-blue-500 transition-colors rounded-full disabled:opacity-50" aria-label="Attach image" disabled={isInputDisabled}>
                            <AttachmentIcon className="w-6 h-6" />
                        </button>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !isInputDisabled && text.trim()) {
                                    handleSend();
                                }
                            }}
                            placeholder={getPlaceholderText()}
                            className="flex-1 p-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition disabled:bg-slate-100"
                            aria-label="Chat message input"
                            disabled={isInputDisabled}
                        />
                         <button onClick={handleGenerateImage} className="bg-teal-500 text-white rounded-full p-3 hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Generate Image with AI" disabled={isInputDisabled || !text.trim()}>
                            <ImageIcon className="w-5 h-5" />
                        </button>
                         <button onClick={handleAskAi} className="bg-purple-500 text-white rounded-full p-3 hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Ask AI" disabled={isInputDisabled || !text.trim()}>
                            <AiIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={text.trim() && !isRecording ? handleSend : handleToggleRecording}
                            className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full transition-colors text-white ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
                            aria-label={getActionButtonLabel()}
                            disabled={isAiLoading || isImageGenerating}
                        >
                            {isRecording 
                                ? <StopIcon className="w-6 h-6" /> 
                                : (text.trim() ? <SendIcon className="w-6 h-6" /> : <MicOnIcon className="w-6 h-6" />)
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;