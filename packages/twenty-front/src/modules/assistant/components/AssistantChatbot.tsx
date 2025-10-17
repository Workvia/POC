import styled from '@emotion/styled';
import { IconPaperclip, IconChevronDown, IconSend } from 'twenty-ui/display';
import { useState, useRef, useEffect } from 'react';

const StyledChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
`;

const StyledMessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StyledMessage = styled.div<{ role: 'user' | 'assistant' }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  ${({ role }) => role === 'user' && `
    align-items: flex-end;
  `}
`;

const StyledMessageContent = styled.div<{ role: 'user' | 'assistant' }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  ${({ theme, role }) => role === 'user' ? `
    background: ${theme.color.blue};
    color: white;
  ` : `
    background: ${theme.background.secondary};
    color: ${theme.font.color.primary};
    border: 1px solid ${theme.border.color.medium};
  `}

  p {
    margin: 0;
    line-height: 1.5;
  }

  code {
    background: ${({ theme }) => theme.background.tertiary};
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 13px;
  }

  pre {
    background: ${({ theme }) => theme.background.tertiary};
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;

    code {
      background: transparent;
      padding: 0;
    }
  }
`;

const StyledMessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 12px;
  padding: 16px;
  margin: 16px 24px;
`;

const StyledInputArea = styled.textarea`
  width: 100%;
  min-height: 60px;
  max-height: 200px;
  border: none;
  outline: none;
  background: transparent;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
  line-height: 1.5;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

const StyledButtonRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledLeftButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledSendButton = styled.button<{ disabled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 24px;
  background: ${({ theme, disabled }) =>
    disabled ? theme.background.tertiary : theme.color.blue};
  border: none;
  border-radius: 8px;
  color: white;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.color.blue70};
    transform: translateY(-1px);
  }
`;

const StyledLoadingDots = styled.div`
  display: flex;
  gap: 4px;
  padding: 12px 16px;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ theme }) => theme.font.color.tertiary};
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-of-type(1) {
      animation-delay: -0.32s;
    }

    &:nth-of-type(2) {
      animation-delay: -0.16s;
    }
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`;

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export const AssistantChatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const userMessageId = Date.now().toString();
    setInput('');
    setIsLoading(true);

    // Add user message
    const newUserMessage: Message = { id: userMessageId, role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

      if (!apiKey) {
        throw new Error('API key not configured');
      }

      // Create assistant message for streaming
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = { id: assistantMessageId, role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMessage]);

      // Call Anthropic Streaming API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage },
          ],
          system: 'You are a helpful AI assistant integrated into a CRM system. You help users manage their contacts, companies, and workflows. Be concise and helpful.',
          stream: false, // Using non-streaming for simplicity and reliability
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.content && data.content[0] && data.content[0].text) {
        // Update the assistant message with the full response
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg.role === 'assistant') {
            lastMsg.content = data.content[0].text;
          }
          return newMessages;
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error calling Anthropic API:', error);
      setMessages(prev => {
        // Remove empty assistant message and add error message
        const filtered = prev.filter(m => m.content !== '');
        return [...filtered, {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Stop propagation to prevent keyboard shortcuts
    e.stopPropagation();

    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <StyledChatContainer>
      <StyledMessagesContainer>
        {messages.length === 0 && (
          <StyledMessage role="assistant">
            <StyledMessageContent role="assistant">
              <p>Hi! I'm your AI assistant. I can help you with:</p>
              <ul>
                <li>Finding and managing contacts and companies</li>
                <li>Understanding your workflows and automations</li>
                <li>Answering questions about your CRM data</li>
                <li>Providing insights and recommendations</li>
              </ul>
              <p>How can I help you today?</p>
            </StyledMessageContent>
          </StyledMessage>
        )}

        {messages.map((message) => (
          <StyledMessage key={message.id} role={message.role}>
            <StyledMessageHeader>
              {message.role === 'user' ? 'You' : 'AI Assistant'}
            </StyledMessageHeader>
            <StyledMessageContent role={message.role}>
              {message.content.split('\n').map((line, i) => (
                <p key={i}>{line || '\u00A0'}</p>
              ))}
            </StyledMessageContent>
          </StyledMessage>
        ))}

        {isLoading && (
          <StyledMessage role="assistant">
            <StyledMessageHeader>AI Assistant</StyledMessageHeader>
            <StyledLoadingDots>
              <span />
              <span />
              <span />
            </StyledLoadingDots>
          </StyledMessage>
        )}
        <div ref={messagesEndRef} />
      </StyledMessagesContainer>

      <form onSubmit={handleSubmit}>
        <StyledInputWrapper>
          <StyledInputArea
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => {
              e.stopPropagation();
              setInput(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            onKeyUp={(e) => e.stopPropagation()}
            onKeyPress={(e) => e.stopPropagation()}
            disabled={isLoading}
          />
          <StyledButtonRow>
            <StyledLeftButtons>
              <StyledButton type="button">
                <IconPaperclip size={18} />
                Attach
              </StyledButton>
              <StyledButton type="button">
                Sources
                <IconChevronDown size={18} />
              </StyledButton>
            </StyledLeftButtons>
            <StyledSendButton type="submit" disabled={!input.trim() || isLoading}>
              <IconSend size={18} />
              {isLoading ? 'Sending...' : 'Send'}
            </StyledSendButton>
          </StyledButtonRow>
        </StyledInputWrapper>
      </form>
    </StyledChatContainer>
  );
};
