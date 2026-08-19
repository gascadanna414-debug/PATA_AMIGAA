import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  CheckCheck, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { ChatChannel, ChatMessage, User } from '../types';
import { StoreController } from '../controllers/storeController';

interface ChatViewProps {
  currentUser: User | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  initialChannelId?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({
  currentUser,
  onOpenAuth,
  initialChannelId
}) => {
  const [channels, setChannels] = useState<ChatChannel[]>(() => StoreController.getChatChannels());
  const [activeChannelId, setActiveChannelId] = useState<string>(initialChannelId || 'channel-rescatistas');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load messages whenever active channel changes or on data update
  const reloadMessages = () => {
    const msgs = StoreController.getMessages(activeChannelId);
    setMessages(msgs);
  };

  useEffect(() => {
    reloadMessages();
    const handleDataChange = () => {
      setChannels(StoreController.getChatChannels());
      reloadMessages();
    };
    window.addEventListener('pata-data-change', handleDataChange);
    return () => window.removeEventListener('pata-data-change', handleDataChange);
  }, [activeChannelId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedImage) return;

    const senderName = currentUser ? currentUser.name : 'Ciudadano de Purificación';
    const senderId = currentUser ? currentUser.id : 'anon-user';
    const senderRole = currentUser ? currentUser.role : 'ciudadano';
    const senderAvatar = currentUser?.avatar;

    StoreController.sendMessage(activeChannelId, {
      senderId,
      senderName,
      senderRole,
      text: inputText.trim() || '📷 [Foto adjunta]',
      imageUrl: attachedImage || undefined,
      avatar: senderAvatar
    });

    setInputText('');
    setAttachedImage(null);
    reloadMessages();
    setChannels(StoreController.getChatChannels());

    // Show simulated typing animation before the controller responds
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      reloadMessages();
    }, 1500);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F2FE] text-[#0369A1] text-xs font-bold mb-2 border border-[#BAE6FD]">
            <MessageSquare className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Canal Comunitario de Purificación, Tolima</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit',sans-serif] text-[#0F172A]">
            Chat con Rescatistas, Voluntarios y Veterinarias
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Comunícate en tiempo real para reportar emergencias, solicitar adopciones o coordinar donaciones en Purificación.
          </p>
        </div>

        <a
          href={`https://wa.me/573128904521?text=${encodeURIComponent('Hola Pata Amiga Purificación, deseo brindar ayuda o consultar un caso animal.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold shadow flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0 transition"
        >
          <Phone className="w-4 h-4 text-[#BAE6FD]" />
          <span>WhatsApp Oficial Tolima</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Main Chat Box Container */}
      <div className="bg-white rounded-3xl border border-[#E8E2D8] shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px] h-[75vh]">
        {/* Left Side: Channel / Contact list */}
        <div className="md:col-span-4 lg:col-span-4 border-r border-[#E8E2D8] bg-[#FAF8F5] flex flex-col">
          <div className="p-4 border-b border-[#E8E2D8] bg-[#F5EFEB]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Canales de Ayuda en Tolima
            </h3>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-[#F1EBE3]">
            {channels.map((chan) => {
              const isActive = chan.id === activeChannelId;
              return (
                <button
                  key={chan.id}
                  id={`chat-channel-btn-${chan.id}`}
                  onClick={() => setActiveChannelId(chan.id)}
                  className={`w-full p-4 text-left transition flex items-start gap-3 cursor-pointer ${
                    isActive 
                      ? 'bg-[#E0F2FE]/80 border-l-4 border-l-[#0284C7] shadow-xs' 
                      : 'hover:bg-[#F5EFEB]/60'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={chan.avatar}
                      alt={chan.name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    {chan.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-sky-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#0F172A] truncate">
                        {chan.name}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {chan.lastMessageTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#0284C7] font-medium truncate mt-0.5">
                      {chan.roleDescription}
                    </p>
                    <p className="text-xs text-slate-600 truncate mt-1 italic">
                      {chan.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* User state footer */}
          <div className="p-3 border-t border-[#E8E2D8] bg-white text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div className="truncate">
                <span className="font-bold text-slate-800 block truncate">
                  {currentUser ? currentUser.name : 'Invitado Ciudadano'}
                </span>
                <span className="text-[10px] text-slate-500">Purificación, Tolima</span>
              </div>
            </div>

            {!currentUser && (
              <button
                onClick={() => onOpenAuth('login')}
                className="text-[11px] text-[#0284C7] font-bold hover:underline cursor-pointer shrink-0"
              >
                Identificarme
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Stream & Message Input */}
        <div className="md:col-span-8 lg:col-span-8 flex flex-col bg-slate-50/30">
          {/* Active Chat Header */}
          <div className="p-4 border-b border-[#E8E2D8] bg-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={activeChannel.avatar}
                  alt={activeChannel.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                {activeChannel.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-sky-500 border border-white rounded-full" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
                  <span>{activeChannel.name}</span>
                  <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                </h3>
                <p className="text-xs text-slate-500">
                  {activeChannel.roleDescription} • <span className="text-[#0369A1] font-semibold">En línea</span>
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500 hidden sm:block">
              Tel: <strong className="text-slate-700">{activeChannel.phone}</strong>
            </div>
          </div>

          {/* Messages Stream Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isMe = msg.senderRole === 'ciudadano' || msg.senderRole === 'user' || (currentUser && msg.senderId === currentUser.id);
              const isSystem = msg.senderRole === 'sistema';

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <div className="bg-[#E0F2FE] border border-[#BAE6FD] text-[#0F172A] text-xs px-4 py-2 rounded-2xl max-w-lg text-center shadow-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#0284C7] shrink-0" />
                      <span>{msg.text}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-[#E0F2FE]">
                      {msg.avatar ? (
                        <img src={msg.avatar} alt={msg.senderName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-[#0F172A] text-white flex items-center justify-center text-xs font-bold">
                          {msg.senderName.charAt(0)}
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`max-w-xs sm:max-w-md rounded-2xl p-3.5 text-xs shadow-xs space-y-1.5 ${
                      isMe
                        ? 'bg-[#0F172A] text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-[#E8E2D8] rounded-bl-none'
                    }`}
                  >
                    {!isMe && (
                      <div className="font-bold text-[11px] text-[#0284C7] flex items-center justify-between">
                        <span>{msg.senderName}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{msg.senderRole}</span>
                      </div>
                    )}

                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="Adjunto en chat"
                        className="rounded-xl max-h-48 w-full object-cover border border-white/20"
                      />
                    )}

                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    <div className={`text-[10px] flex items-center justify-end gap-1 ${isMe ? 'text-[#BAE6FD]' : 'text-slate-400'}`}>
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-[#38BDF8]" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-500 italic bg-white px-3 py-1.5 rounded-full max-w-fit border border-[#E8E2D8] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-bounce delay-200" />
                <span>{activeChannel.name} está respondiendo...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Attached Image Preview */}
          {attachedImage && (
            <div className="p-3 bg-[#E0F2FE] border-t border-[#BAE6FD] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={attachedImage} alt="Adjunto" className="w-12 h-12 rounded-lg object-cover border border-[#BAE6FD]" />
                <span className="text-xs text-[#0F172A] font-semibold">Imagen lista para enviar</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
              >
                Quitar
              </button>
            </div>
          )}

          {/* Message Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-[#E8E2D8] flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileAttach}
              accept="image/*"
              className="hidden"
            />

            <button
              id="chat-attach-img-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl text-slate-500 hover:text-[#0284C7] hover:bg-[#E0F2FE] transition cursor-pointer"
              title="Adjuntar foto de emergencia"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              id="chat-message-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Escribe un mensaje para ${activeChannel.name}...`}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7] transition"
            />

            <button
              id="chat-send-btn"
              type="submit"
              disabled={!inputText.trim() && !attachedImage}
              className="p-2.5 sm:px-5 sm:py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
