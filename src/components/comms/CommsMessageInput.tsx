import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, SmilePlus, AtSign, Code, Bold, Italic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '🚀', '👀', '😂', '✅', '🎉', '💯', '🙏', '🤔', '😍'];

interface Props {
  onSend: (content: string) => void;
  onTyping: () => void;
  channelName: string;
  placeholder?: string;
}

export function CommsMessageInput({ onSend, onTyping, channelName, placeholder }: Props) {
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!content.trim()) return;
    onSend(content);
    setContent('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (val: string) => {
    setContent(val);
    onTyping();
  };

  const insertEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const wrapSelection = (prefix: string, suffix: string) => {
    const ta = inputRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.substring(start, end);
    const newContent = content.substring(0, start) + prefix + selected + suffix + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  return (
    <div className="border-t border-border p-3">
      {/* Formatting toolbar */}
      <div className="flex items-center gap-0.5 mb-1.5">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => wrapSelection('**', '**')}>
          <Bold className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => wrapSelection('*', '*')}>
          <Italic className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => wrapSelection('`', '`')}>
          <Code className="w-3.5 h-3.5" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <SmilePlus className="w-3.5 h-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" side="top">
            <div className="grid grid-cols-6 gap-1">
              {QUICK_EMOJIS.map(e => (
                <button key={e} onClick={() => insertEmoji(e)} className="text-lg hover:scale-125 transition-transform p-1">{e}</button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Text area + send */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={content}
            onChange={e => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || `Message #${channelName}`}
            rows={1}
            className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[40px] max-h-[120px]"
            style={{ height: 'auto', overflowY: content.split('\n').length > 3 ? 'auto' : 'hidden' }}
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!content.trim()}
          size="icon"
          className="h-10 w-10 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
