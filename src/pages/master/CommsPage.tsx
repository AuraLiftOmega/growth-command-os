import { useState, useEffect } from 'react';
import { MasterOSLayout } from '@/components/master-os/MasterOSLayout';
import { CommsChannelSidebar } from '@/components/comms/CommsChannelSidebar';
import { CommsMessageArea } from '@/components/comms/CommsMessageArea';
import { CommsThreadPanel } from '@/components/comms/CommsThreadPanel';
import {
  useCommsChannels, useCommsMessages, useCommsReactions, useCommsPresence,
  type CommsMessage,
} from '@/hooks/useComms';

export default function CommsPage() {
  const { channels, loading: chLoading, createChannel } = useCommsChannels();
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [threadMessage, setThreadMessage] = useState<CommsMessage | null>(null);

  // Auto-select first channel
  useEffect(() => {
    if (!activeChannelId && channels.length > 0) {
      setActiveChannelId(channels[0].id);
    }
  }, [channels, activeChannelId]);

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const { messages, loading: msgLoading, sendMessage, deleteMessage, editMessage, pinMessage } = useCommsMessages(activeChannelId);
  const { reactions, toggleReaction } = useCommsReactions(messages.map(m => m.id));
  const { onlineUsers, typingUsers, broadcastTyping } = useCommsPresence(activeChannelId);

  const handleSelectChannel = (id: string) => {
    setActiveChannelId(id);
    setThreadMessage(null);
  };

  const handleOpenThread = (messageId: string) => {
    const msg = messages.find(m => m.id === messageId);
    if (msg) setThreadMessage(msg);
  };

  return (
    <MasterOSLayout>
      <div className="flex h-[calc(100vh-6rem)] -m-4 lg:-m-6 rounded-lg overflow-hidden border border-border bg-background">
        {/* Channel sidebar */}
        <CommsChannelSidebar
          channels={channels}
          activeChannelId={activeChannelId}
          onSelectChannel={handleSelectChannel}
          onCreateChannel={createChannel}
          onlineCount={Object.keys(onlineUsers).length}
        />

        {/* Main message area */}
        {activeChannel ? (
          <CommsMessageArea
            messages={messages}
            reactions={reactions}
            loading={msgLoading}
            channelName={activeChannel.name}
            typingUsers={typingUsers}
            onSend={(content) => sendMessage(content)}
            onReact={toggleReaction}
            onDelete={deleteMessage}
            onEdit={editMessage}
            onPin={pinMessage}
            onOpenThread={handleOpenThread}
            onTyping={broadcastTyping}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            {chLoading ? 'Loading channels...' : 'Create your first channel to start'}
          </div>
        )}

        {/* Thread panel */}
        {threadMessage && activeChannel && (
          <CommsThreadPanel
            parentMessage={threadMessage}
            channelId={activeChannel.id}
            channelName={activeChannel.name}
            onClose={() => setThreadMessage(null)}
          />
        )}
      </div>
    </MasterOSLayout>
  );
}
