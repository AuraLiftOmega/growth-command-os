import { useState } from 'react';
import { cn } from '@/lib/utils';
import { type CommsMessage, type CommsReaction } from '@/hooks/useComms';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  SmilePlus, MessageSquare, Pin, Pencil, Trash2, MoreHorizontal,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '🚀', '👀', '😂', '✅', '🎉'];

interface Props {
  message: CommsMessage;
  reactions: CommsReaction[];
  compact: boolean;
  isOwn: boolean;
  onReact: (emoji: string) => void;
  onDelete: () => void;
  onEdit: (content: string) => void;
  onPin: () => void;
  onOpenThread: () => void;
}

export function CommsMessageBubble({ message, reactions, compact, isOwn, onReact, onDelete, onEdit, onPin, onOpenThread }: Props) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const userLabel = message.user_email?.split('@')[0] || message.user_id.slice(0, 8);
  const time = new Date(message.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  // Group reactions by emoji
  const grouped: Record<string, { count: number; userIds: string[] }> = {};
  reactions.forEach(r => {
    if (!grouped[r.emoji]) grouped[r.emoji] = { count: 0, userIds: [] };
    grouped[r.emoji].count++;
    grouped[r.emoji].userIds.push(r.user_id);
  });

  const handleEditSave = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(editContent.trim());
    }
    setEditing(false);
  };

  return (
    <div
      className={cn('group relative px-2 py-0.5 rounded-md transition-colors', hovered && 'bg-accent/40')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover actions bar */}
      {hovered && (
        <div className="absolute -top-3 right-2 flex items-center gap-0.5 bg-popover border border-border rounded-md shadow-sm p-0.5 z-10">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6"><SmilePlus className="w-3.5 h-3.5" /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" side="top">
              <div className="flex gap-1">
                {QUICK_EMOJIS.map(e => (
                  <button key={e} onClick={() => onReact(e)} className="text-lg hover:scale-125 transition-transform">{e}</button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onOpenThread}>
            <MessageSquare className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onPin}>
            <Pin className={cn('w-3.5 h-3.5', message.is_pinned && 'text-primary')} />
          </Button>
          {isOwn && (
            <>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditing(true); setEditContent(message.content); }}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={onDelete}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar / spacer for compact */}
        {compact ? (
          <div className="w-8 shrink-0 flex items-center justify-center">
            {hovered && <span className="text-[10px] text-muted-foreground">{time}</span>}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-xs font-bold text-primary">{userLabel[0]?.toUpperCase()}</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Username + timestamp */}
          {!compact && (
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-sm">{userLabel}</span>
              <span className="text-[10px] text-muted-foreground">{time}</span>
              {message.is_pinned && <Pin className="w-3 h-3 text-amber-500" />}
              {message.is_edited && <span className="text-[10px] text-muted-foreground">(edited)</span>}
            </div>
          )}

          {/* Content */}
          {editing ? (
            <div className="flex gap-2">
              <Input
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') setEditing(false); }}
                className="h-8 text-sm"
                autoFocus
              />
              <Button size="sm" onClick={handleEditSave} className="h-8 text-xs">Save</Button>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}

          {/* Reactions */}
          {Object.keys(grouped).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {Object.entries(grouped).map(([emoji, data]) => (
                <button
                  key={emoji}
                  onClick={() => onReact(emoji)}
                  className={cn(
                    'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border transition-colors',
                    data.userIds.includes(message.user_id)
                      ? 'bg-primary/10 border-primary/30'
                      : 'bg-muted border-border hover:bg-accent'
                  )}
                >
                  <span>{emoji}</span>
                  <span className="text-[10px] font-medium">{data.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Thread indicator */}
          {message.thread_count > 0 && (
            <button onClick={onOpenThread} className="mt-1 text-xs text-primary hover:underline flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {message.thread_count} {message.thread_count === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
