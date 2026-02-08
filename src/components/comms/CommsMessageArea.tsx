import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { type CommsMessage, type CommsReaction } from '@/hooks/useComms';
import { CommsMessageBubble } from './CommsMessageBubble';
import { CommsMessageInput } from './CommsMessageInput';

interface Props {
  messages: CommsMessage[];
  reactions: CommsReaction[];
  loading: boolean;
  channelName: string;
  typingUsers: string[];
  onSend: (content: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onDelete: (messageId: string) => void;
  onEdit: (messageId: string, content: string) => void;
  onPin: (messageId: string, pinned: boolean) => void;
  onOpenThread: (messageId: string) => void;
  onTyping: () => void;
}

export function CommsMessageArea({
  messages, reactions, loading, channelName, typingUsers,
  onSend, onReact, onDelete, onEdit, onPin, onOpenThread, onTyping,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Group messages by date
  const grouped: { date: string; msgs: CommsMessage[] }[] = [];
  messages.forEach(msg => {
    const date = new Date(msg.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const last = grouped[grouped.length - 1];
    if (last && last.date === date) last.msgs.push(msg);
    else grouped.push({ date, msgs: [msg] });
  });

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Channel Header */}
      <div className="h-12 border-b border-border flex items-center px-4 shrink-0">
        <span className="text-muted-foreground mr-1.5 text-lg">#</span>
        <h3 className="font-semibold text-sm">{channelName}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-4xl mb-3">🚀</span>
            <p className="font-semibold text-sm">Welcome to #{channelName}</p>
            <p className="text-xs text-muted-foreground mt-1">This is the beginning. Send the first message.</p>
          </div>
        ) : (
          grouped.map(group => (
            <div key={group.date}>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{group.date}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              {group.msgs.map((msg, idx) => {
                const prevMsg = group.msgs[idx - 1];
                const compact = prevMsg && prevMsg.user_id === msg.user_id &&
                  new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() < 300000;
                const msgReactions = reactions.filter(r => r.message_id === msg.id);

                return (
                  <CommsMessageBubble
                    key={msg.id}
                    message={msg}
                    reactions={msgReactions}
                    compact={!!compact}
                    isOwn={msg.user_id === user?.id}
                    onReact={emoji => onReact(msg.id, emoji)}
                    onDelete={() => onDelete(msg.id)}
                    onEdit={content => onEdit(msg.id, content)}
                    onPin={() => onPin(msg.id, !msg.is_pinned)}
                    onOpenThread={() => onOpenThread(msg.id)}
                  />
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 pb-1 text-xs text-muted-foreground animate-pulse">
          {typingUsers.map(u => u.split('@')[0]).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Input */}
      <CommsMessageInput onSend={onSend} onTyping={onTyping} channelName={channelName} />
    </div>
  );
}
