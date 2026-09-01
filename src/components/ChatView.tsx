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
import { resolveImageUrl, handleImageError } from '../utils/imageUtils';

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
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE2D5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#9E6B38] block mb-1">
            Canal Comunitario — Purificación, Tolima
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Fraunces',serif] text-[#2C1E14]">
            Red de voluntarios, rescatistas y veterinarias
          </h1>
          <p className="text-xs sm:text-sm text-[#6E574B] mt-1">
            Comunícate en tiempo real para coordinar rescates de emergencia, seguimiento a adopciones o entrega de donaciones en Purificación.
          </p>
        </div>

        <a
          href={`https://wa.me/573128904521?text=${encodeURIComponent('Hola Pata Amiga Purificación, deseo brindar ayuda o consultar un caso animal.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-[#9E6B38] hover:bg-[#86582A] text-white rounded-full text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0 transition"
        >
          <Phone className="w-4 h-4 text-[#FAF6F0]" />
          <span>WhatsApp de Rescate</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Main Chat Box Container */}
      <div className="bg-white rounded-3xl border border-[#EAE2D5] shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px] h-[75vh]">
        {/* Left Side: Channel / Contact list */}
        <div className="md:col-span-4 lg:col-span-4 border-r border-[#EAE2D5] bg-[#FAF6F0] flex flex-col">
          <div className="p-4 border-b border-[#EAE2D5] bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2C1E14] font-['Fraunces',serif]">
              Canales de Ayuda en Tolima
            </h3>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-[#EAE2D5]">
            {channels.map((chan) => {
              const isActive = chan.id === activeChannelId;
              return (
                <button
                  key={chan.id}
                  id={`chat-channel-btn-${chan.id}`}
                  onClick={() => setActiveChannelId(chan.id)}
                  className={`w-full p-4 text-left transition flex items-start gap-3 cursor-pointer ${
                    isActive 
                      ? 'bg-white border-l-4 border-l-[#9E6B38] shadow-xs' 
                      : 'hover:bg-white/60'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={resolveImageUrl(chan.avatar, 'volunteer')}
                      alt={chan.name}
                      className="w-11 h-11 rounded-full object-cover border border-[#EAE2D5]"
                      onError={(e) => handleImageError(e, 'volunteer')}
                      referrerPolicy="no-referrer"
                    />
                    {chan.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-amber-600 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-[#2C1E14] truncate">
                        {chan.name}
                      </h4>
                      <span className="text-[10px] text-[#8A7568]">
                        {chan.lastMessageTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9E6B38] font-medium truncate mt-0.5">
                      {chan.roleDescription}
                    </p>
                    <p className="text-xs text-[#6E574B] truncate mt-1 italic">
                      {chan.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* User state footer */}
          <div className="p-3 border-t border-[#EAE2D5] bg-white text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-[#2C1E14] text-[#FAF6F0] flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div className="truncate">
                <span className="font-semibold text-[#2C1E14] block truncate">
                  {currentUser ? currentUser.name : 'Invitado Ciudadano'}
                </span>
                <span className="text-[10px] text-[#8A7568]">Purificación, Tolima</span>
              </div>
            </div>

            {!currentUser && (
              <button
                onClick={() => onOpenAuth('login')}
                className="text-[11px] text-[#9E6B38] font-semibold hover:underline cursor-pointer shrink-0"
              >
                Identificarme
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Stream & Message Input */}
        <div className="md:col-span-8 lg:col-span-8 flex flex-col bg-[#FAF6F0]/40">
          {/* Active Chat Header */}
          <div className="p-4 border-b border-[#EAE2D5] bg-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={resolveImageUrl(activeChannel.avatar, 'volunteer')}
                  alt={activeChannel.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#EAE2D5]"
                  onError={(e) => handleImageError(e, 'volunteer')}
                  referrerPolicy="no-referrer"
                />
                {activeChannel.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-amber-600 border border-white rounded-full" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#2C1E14] flex items-center gap-1.5">
                  <span>{activeChannel.name}</span>
                  <ShieldCheck className="w-4 h-4 text-[#9E6B38]" />
                </h3>
                <p className="text-xs text-[#8A7568]">
                  {activeChannel.roleDescription} • <span className="text-[#9E6B38] font-medium">En línea</span>
                </p>
              </div>
            </div>

            <div className="text-xs text-[#8A7568] hidden sm:block">
              Tel: <strong className="text-[#2C1E14]">{activeChannel.phone}</strong>
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
                    <div className="bg-[#FAF6F0] border border-[#EAE2D5] text-[#2C1E14] text-xs px-4 py-2 rounded-2xl max-w-lg text-center shadow-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#9E6B38] shrink-0" />
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
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#EAE2D5] bg-[#FAF6F0]">
                      {msg.avatar ? (
                        <img 
                          src={resolveImageUrl(msg.avatar, 'volunteer')} 
                          alt={msg.senderName} 
                          className="w-full h-full object-cover" 
                          onError={(e) => handleImageError(e, 'volunteer')}
                          referrerPolicy="no-referrer" 
                        />
                      ) : (
                        <div className="w-full h-full bg-[#2C1E14] text-white flex items-center justify-center text-xs font-bold">
                          {msg.senderName.charAt(0)}
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`max-w-xs sm:max-w-md rounded-2xl p-3.5 text-xs shadow-xs space-y-1.5 ${
                      isMe
                        ? 'bg-[#2C1E14] text-[#FAF6F0] rounded-br-none'
                        : 'bg-white text-[#2C1E14] border border-[#EAE2D5] rounded-bl-none'
                    }`}
                  >
                    {!isMe && (
                      <div className="font-semibold text-[11px] text-[#9E6B38] flex items-center justify-between">
                        <span>{msg.senderName}</span>
                        <span className="text-[10px] text-[#8A7568] font-normal">{msg.senderRole}</span>
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

                    <div className={`text-[10px] flex items-center justify-end gap-1 ${isMe ? 'text-[#D8C7BA]' : 'text-[#8A7568]'}`}>
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-[#9E6B38]" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-[#6E574B] italic bg-white px-3 py-1.5 rounded-full max-w-fit border border-[#EAE2D5] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#9E6B38] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#9E6B38] animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-[#9E6B38] animate-bounce delay-200" />
                <span>{activeChannel.name} está respondiendo...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Attached Image Preview */}
          {attachedImage && (
            <div className="p-3 bg-[#FAF6F0] border-t border-[#EAE2D5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={attachedImage} alt="Adjunto" className="w-12 h-12 rounded-lg object-cover border border-[#EAE2D5]" />
                <span className="text-xs text-[#2C1E14] font-semibold">Imagen lista para enviar</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
              >
                Quitar
              </button>
            </div>
          )}

          {/* Message Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-[#EAE2D5] flex items-center gap-2">
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
              className="p-2.5 rounded-full text-[#6E574B] hover:text-[#2C1E14] hover:bg-[#FAF6F0] transition cursor-pointer"
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
              className="flex-1 px-4 py-2.5 bg-[#FAF6F0] border border-[#EAE2D5] rounded-full text-xs sm:text-sm text-[#2C1E14] placeholder-[#8A7568] focus:outline-none focus:ring-2 focus:ring-[#9E6B38] transition"
            />

            <button
              id="chat-send-btn"
              type="submit"
              disabled={!inputText.trim() && !attachedImage}
              className="p-2.5 sm:px-5 sm:py-2.5 bg-[#9E6B38] hover:bg-[#86582A] text-white rounded-full font-semibold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
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
