'use client';

import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaSmile, FaImage, FaEllipsisH, FaCheck, FaCheckDouble, FaUserCircle } from 'react-icons/fa';

const initialMessages = [
  { id: 1, user: 'iShielda', text: 'Hello mate!', sender: 'other', time: '18:45', avatar: '/avatar1.png', status: 'read' },
  { id: 2, user: 'Samuraix', text: "Hi! I hope you don't mind having no mic", sender: 'other', time: '18:46', avatar: '/avatar3.png', status: 'read' },
  { id: 3, user: 'iShielda', text: 'Its fine, lets just wait for others to join', sender: 'other', time: '18:47', avatar: '/avatar1.png', status: 'read' },
  { id: 4, user: 'You', text: 'Okay, sounds good! I will be ready in 5 min.', sender: 'self', time: '18:48', status: 'delivered' },
];

export default function LobbyChatBox() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() === '') return;
    
    const newMessage = { 
      id: messages.length + 1, 
      user: 'You', 
      text: input, 
      sender: 'self',
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };
    
    setMessages([...messages, newMessage]);
    setInput('');
    
    // Simulate message being delivered
    setTimeout(() => {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === newMessage.id ? {...msg, status: 'delivered'} : msg
        )
      );
      
      // Simulate other user typing
      setTimeout(() => {
        setIsTyping(true);
        
        // Simulate other user's reply
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prevMessages => [
            ...prevMessages, 
            { 
              id: prevMessages.length + 1,
              user: 'iShielda', 
              text: 'No worries, take your time!', 
              sender: 'other',
              time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), 
              avatar: '/avatar1.png', 
              status: 'read'
            }
          ]);
          
          // Mark your message as read
          setTimeout(() => {
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === newMessage.id ? {...msg, status: 'read'} : msg
              )
            );
          }, 1000);
        }, 3000);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#1a2333] to-[#171f2c] border border-[#2a364a] rounded-xl shadow-xl overflow-hidden relative">
      {/* Header */}
      <div className="px-4 py-3 bg-[#1e293b] border-b border-[#334155] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="font-bold text-white text-lg">Lobby Chat</div>
          <div className="text-xs text-blue-300 bg-blue-500/20 px-2 py-1 rounded-full">{messages.length} messages</div>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors">
          <FaEllipsisH />
        </button>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#334155] scrollbar-track-transparent">
        {messages.map((msg, idx) => {
          const isFirstMessageFromUser = idx === 0 || messages[idx - 1].user !== msg.user;
          const showAvatar = msg.sender === 'other' && isFirstMessageFromUser;
          
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'self' ? 'justify-end' : 'justify-start'} group`}>
              {/* Avatar for other users */}
              {showAvatar ? (
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img 
                    src={msg.avatar} 
                    alt={msg.user} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://via.placeholder.com/32/4f46e5/ffffff?text=${msg.user.charAt(0)}`;
                    }}
                  />
                </div>
              ) : msg.sender === 'other' ? (
                <div className="w-8 flex-shrink-0" /> // Spacer for alignment
              ) : null}
              
              {/* Message bubble */}
              <div className={`
                relative max-w-[75%] 
                ${msg.sender === 'self' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl rounded-bl-2xl'
                  : 'bg-[#252f3f] text-gray-100 rounded-t-2xl rounded-br-2xl'}
                p-3 shadow-md
              `}>
                {/* Username for others - only show on first message from user */}
                {msg.sender === 'other' && isFirstMessageFromUser && (
                  <div className="font-semibold text-xs text-blue-300 mb-1">{msg.user}</div>
                )}
                
                {/* Message text */}
                <div className="text-sm">{msg.text}</div>
                
                {/* Time and status */}
                <div className={`flex items-center gap-1 text-[10px] mt-1 ${msg.sender === 'self' ? 'text-blue-200' : 'text-gray-400'}`}>
                  <span>{msg.time}</span>
                  {msg.sender === 'self' && (
                    <span>
                      {msg.status === 'sent' && <FaCheck className="text-[10px]" />}
                      {msg.status === 'delivered' && <FaCheckDouble className="text-[10px]" />}
                      {msg.status === 'read' && <FaCheckDouble className="text-[10px] text-blue-300" />}
                    </span>
                  )}
                </div>
                
                {/* Message tail */}
                <div className={`absolute bottom-0 ${msg.sender === 'self' ? '-right-2' : '-left-2'} w-4 h-4 overflow-hidden`}>
                  <div className={`
                    w-4 h-4 transform rotate-45 origin-bottom-left
                    ${msg.sender === 'self' 
                      ? 'bg-blue-700 translate-x-1/2 translate-y-1/2'
                      : 'bg-[#252f3f] -translate-x-1/2 translate-y-1/2'}
                  `}></div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[#334155] flex items-center justify-center">
              <FaUserCircle className="text-gray-300 w-full h-full" />
            </div>
            <div className="bg-[#252f3f] text-gray-100 p-3 rounded-t-2xl rounded-br-2xl shadow-md max-w-[75%]">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {/* This empty div is for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="p-3 border-t border-[#334155] bg-[#1e293b]">
        <div className="flex items-center gap-2 bg-[#0f172a] rounded-lg px-3 py-2 border border-[#334155] focus-within:border-blue-600 transition-colors">
          <button className="text-gray-400 hover:text-blue-400 transition-colors p-1">
            <FaSmile />
          </button>
          
          <input
            type="text"
            className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-500 outline-none"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          />
          
          <button className="text-gray-400 hover:text-blue-400 transition-colors p-1">
            <FaImage />
          </button>
          
          <button
            className={`ml-1 p-2 rounded-full transition-all duration-200 ${input.trim() 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:scale-105 active:scale-95' 
              : 'bg-[#1e293b] text-gray-500 cursor-not-allowed'}`}
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <FaPaperPlane className={`text-sm ${input.trim() ? 'text-blue-100' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}