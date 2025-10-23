'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';

// AI Elements components
import { 
  Conversation, 
  ConversationContent,
  ConversationEmptyState 
} from '@/components/ai-elements/conversation';

import { 
  Message, 
  MessageContent 
} from '@/components/ai-elements/message';

import { 
  PromptInput, 
  PromptInputTextarea, 
  PromptInputSubmit 
} from '@/components/ai-elements/prompt-input';

import { Response } from '@/components/ai-elements/response';

export function SimpleChat() {
  const [input, setInput] = useState('');
  
  // FIXED: useChat without 'api' option (uses default /api/chat endpoint)
  // OR specify a custom transport if needed
  const { messages, sendMessage, status } = useChat();

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    console.log('[SimpleChat] Sending message:', input);
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-6">
      <Conversation className="flex-1 mb-4">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState 
              title="Start a conversation"
              description="Ask me anything!"
            />
          ) : (
            messages.map((message) => (
              <Message 
                key={message.id} 
                from={message.role}
              >
                <MessageContent>
                  <Response>
                    {/* FIXED: Access text from parts array */}
                    {message.parts
                      ?.filter(part => part.type === 'text')
                      .map(part => part.text)
                      .join('')}
                  </Response>
                </MessageContent>
              </Message>
            ))
          )}
        </ConversationContent>
      </Conversation>

      {/* Input Form */}
      <PromptInput onSubmit={(message) => {
  if (!input.trim() || isLoading) return;
  console.log('[SimpleChat] Sending message:', message);
  sendMessage({ text: input });
  setInput('');
}}>
  <PromptInputTextarea
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="Type your message..."
    disabled={isLoading}
  />
  <PromptInputSubmit disabled={isLoading || !input.trim()}>
    {isLoading ? 'Sending...' : 'Send'}
  </PromptInputSubmit>
</PromptInput>
    </div>
  );
}