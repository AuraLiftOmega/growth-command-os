import { type CommsMessage, useCommsThread } from '@/hooks/useComms';
import { useAuth } from '@/hooks/useAuth';
import { X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommsMessageInput } from './CommsMessageInput';

interface Props {
  parentMessage: CommsMessage;
  channelId: string;
  channelName: string;
  onClose: () => void;
}

export function CommsThreadPanel({ parentMessage, channelId, channelName, onClose }: Props) {
  const { replies, loading, sendReply } = useCommsThread(parentMessage.id);
  const { user } = useAuth();

  const userLabel = (userId: string) => userId.slice(0, 8);

  return (
    <div className="w-80 border-l border-border flex flex-col bg-background h-full">
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Thread</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Parent message */}
      <div className="p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary">{userLabel(parentMessage.user_id)[0]?.toUpperCase()}</span>
          </div>
          <span className="text-xs font-medium">{userLabel(parentMessage.user_id)}</span>
          <span className="text-[10px] text-muted-foreground">
            {new Date(parentMessage.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-sm">{parentMessage.content}</p>
      </div>

      {/* Replies */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading ? (
          <p className="text-xs text-muted-foreground text-center">Loading...</p>
        ) : replies.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center mt-8">No replies yet. Start the thread!</p>
        ) : (
          replies.map(reply => (
            <div key={reply.id} className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-primary">{userLabel(reply.user_id)[0]?.toUpperCase()}</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium">{userLabel(reply.user_id)}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(reply.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm">{reply.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply input */}
      <CommsMessageInput
        onSend={(content) => sendReply(content, channelId)}
        onTyping={() => {}}
        channelName={channelName}
        placeholder="Reply in thread..."
      />
    </div>
  );
}
