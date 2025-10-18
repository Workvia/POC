import styled from '@emotion/styled';
import { IconPaperclip, IconChevronDown, IconSend, IconPlus, IconCheck, IconCopy } from 'twenty-ui/display';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  position: relative;
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
  white-space: pre-wrap;
  ${({ theme, role }) => role === 'user' ? `
    background: ${theme.color.blue};
    color: white;
  ` : `
    background: ${theme.background.secondary};
    color: ${theme.font.color.primary};
    border: 1px solid ${theme.border.color.medium};
    padding-right: 48px;
  `}

  /* Markdown styling */
  p {
    margin: 8px 0;
  }

  ul, ol {
    margin: 8px 0;
    padding-left: 20px;
  }

  li {
    margin: 4px 0;
  }

  code {
    background: ${({ theme, role }) =>
      role === 'user'
        ? 'rgba(255, 255, 255, 0.2)'
        : theme.background.transparent.light};
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 0.9em;
  }

  pre {
    background: ${({ theme, role }) =>
      role === 'user'
        ? 'rgba(255, 255, 255, 0.1)'
        : theme.background.transparent.light};
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 8px 0;

    code {
      background: transparent;
      padding: 0;
    }
  }

  strong {
    font-weight: 600;
  }
`;

const StyledMessageHeader = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: 0 4px;
`;

const StyledInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: ${({ theme }) => theme.background.tertiary};
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
  padding: 12px 0;

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

const StyledShimmer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 0;
  max-width: 75%;
`;

const StyledShimmerLine = styled.div<{ width: string }>`
  height: 12px;
  width: ${({ width }) => width};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.background.transparent.light} 0%,
    ${({ theme }) => theme.background.secondary} 50%,
    ${({ theme }) => theme.background.transparent.light} 100%
  );
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 1.5s infinite;

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

const StyledSuggestionsContainer = styled.div`
  padding: 0 24px 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const StyledSuggestionChip = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${({ theme }) => theme.background.transparent.light};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 20px;
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.background.secondary};
    border-color: ${({ theme }) => theme.color.blue};
    color: ${({ theme }) => theme.color.blue};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const StyledReasoningContainer = styled.div<{ isExpanded: boolean }>`
  margin: 8px 0;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 8px;
  background: ${({ theme }) => theme.background.tertiary};
  overflow: hidden;
`;

const StyledReasoningHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: 13px;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledReasoningContent = styled.div`
  padding: 8px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledReasoningStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledCopyButton = styled.button<{ copied: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: ${({ theme }) => theme.background.transparent.light};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 6px;
  color: ${({ theme, copied }) =>
    copied ? theme.color.green : theme.font.color.tertiary};
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0.6;

  &:hover {
    opacity: 1;
    background: ${({ theme }) => theme.background.secondary};
    border-color: ${({ theme }) => theme.border.color.strong};
    color: ${({ theme }) => theme.font.color.primary};
  }

  &:active {
    transform: scale(0.95);
  }

  &::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    right: 0;
    margin-bottom: 6px;
    padding: 4px 8px;
    background: ${({ theme }) => theme.background.primary};
    border: 1px solid ${({ theme }) => theme.border.color.medium};
    border-radius: 4px;
    color: ${({ theme }) => theme.font.color.primary};
    font-size: 11px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
  }

  &:hover::after {
    opacity: 1;
  }
`;

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoningSteps?: string[];
};

const SUGGESTIONS = [
  {
    icon: IconPlus,
    text: 'Find companies in my CRM',
  },
  {
    icon: IconCheck,
    text: 'Show me recent contacts',
  },
  {
    icon: IconCopy,
    text: 'Search for Anthropic',
  },
];

export const AssistantChatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState<Set<string>>(new Set());
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
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
    setInput('');
    setIsLoading(true);

    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Call backend API
      const response = await fetch('http://localhost:3003/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newUserMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      // Create assistant message for streaming
      const assistantMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: ''
      }]);

      if (reader) {
        let fullText = '';
        const reasoningSteps: string[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          // Parse AI SDK data stream format
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('0:')) {
              // Text chunk - parse JSON to properly handle escaped characters
              try {
                const text = JSON.parse(line.substring(2));
                fullText += text;

                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMsg = newMessages[newMessages.length - 1];
                  if (lastMsg.role === 'assistant') {
                    lastMsg.content = fullText;
                    lastMsg.reasoningSteps = reasoningSteps.length > 0 ? [...reasoningSteps] : undefined;
                  }
                  return newMessages;
                });
              } catch (e) {
                // Skip malformed lines
                console.warn('Failed to parse stream line:', line);
              }
            } else if (line.startsWith('8:')) {
              // Reasoning chunk - tool usage events
              try {
                const reasoning = JSON.parse(line.substring(2));
                reasoningSteps.push(reasoning);

                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMsg = newMessages[newMessages.length - 1];
                  if (lastMsg.role === 'assistant') {
                    lastMsg.reasoningSteps = [...reasoningSteps];
                  }
                  return newMessages;
                });
              } catch (e) {
                console.warn('Failed to parse reasoning line:', line);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error calling API:', error);
      setMessages(prev => {
        const filtered = prev.filter(m => m.content !== '');
        return [...filtered, {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error connecting to the AI assistant. Please make sure the backend server is running on port 3002.',
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (isLoading) return;

    const userMessage = suggestion.trim();
    setIsLoading(true);

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await fetch('http://localhost:3003/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newUserMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      const assistantMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: ''
      }]);

      if (reader) {
        let fullText = '';
        const reasoningSteps: string[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const text = JSON.parse(line.substring(2));
                fullText += text;

                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMsg = newMessages[newMessages.length - 1];
                  if (lastMsg.role === 'assistant') {
                    lastMsg.content = fullText;
                    lastMsg.reasoningSteps = reasoningSteps.length > 0 ? [...reasoningSteps] : undefined;
                  }
                  return newMessages;
                });
              } catch (e) {
                console.warn('Failed to parse stream line:', line);
              }
            } else if (line.startsWith('8:')) {
              try {
                const reasoning = JSON.parse(line.substring(2));
                reasoningSteps.push(reasoning);

                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMsg = newMessages[newMessages.length - 1];
                  if (lastMsg.role === 'assistant') {
                    lastMsg.reasoningSteps = [...reasoningSteps];
                  }
                  return newMessages;
                });
              } catch (e) {
                console.warn('Failed to parse reasoning line:', line);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error calling API:', error);
      setMessages(prev => {
        const filtered = prev.filter(m => m.content !== '');
        return [...filtered, {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error connecting to the AI assistant. Please make sure the AI Gateway is running on port 3003.',
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledChatContainer>
      <StyledMessagesContainer>
        {messages.length === 0 && (
          <StyledMessage role="assistant">
            <StyledMessageContent role="assistant">
              Hi! I'm your AI assistant powered by Claude. I can help you with:
              {'\n\n'}• Finding and managing contacts and companies
              {'\n'}• Understanding your workflows and automations
              {'\n'}• Answering questions about your CRM data
              {'\n'}• Providing insights and recommendations
              {'\n\n'}How can I help you today?
            </StyledMessageContent>
          </StyledMessage>
        )}

        {messages.map((message) => (
          <StyledMessage key={message.id} role={message.role}>
            <StyledMessageHeader>
              {message.role === 'user' ? 'You' : 'AI Assistant'}
            </StyledMessageHeader>

            {/* Reasoning Component - Show tool usage */}
            {message.role === 'assistant' && message.reasoningSteps && message.reasoningSteps.length > 0 && (
              <StyledReasoningContainer isExpanded={expandedReasoning.has(message.id)}>
                <StyledReasoningHeader
                  onClick={() => {
                    setExpandedReasoning(prev => {
                      const next = new Set(prev);
                      if (next.has(message.id)) {
                        next.delete(message.id);
                      } else {
                        next.add(message.id);
                      }
                      return next;
                    });
                  }}
                >
                  <span>🧠 Reasoning ({message.reasoningSteps.length} steps)</span>
                  <IconChevronDown
                    size={16}
                    style={{
                      transform: expandedReasoning.has(message.id) ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </StyledReasoningHeader>
                {expandedReasoning.has(message.id) && (
                  <StyledReasoningContent>
                    {message.reasoningSteps.map((step, idx) => (
                      <StyledReasoningStep key={idx}>
                        <span>{step}</span>
                      </StyledReasoningStep>
                    ))}
                  </StyledReasoningContent>
                )}
              </StyledReasoningContainer>
            )}

            <StyledMessageContent role={message.role}>
              {message.role === 'assistant' ? (
                <>
                  {/* Copy Button - Top Right Corner */}
                  {message.content && (
                    <StyledCopyButton
                      copied={copiedMessageId === message.id}
                      data-tooltip={copiedMessageId === message.id ? 'Copied!' : 'Copy'}
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(message.content);
                          setCopiedMessageId(message.id);
                          setTimeout(() => setCopiedMessageId(null), 2000);
                        } catch (err) {
                          console.error('Failed to copy:', err);
                        }
                      }}
                    >
                      {copiedMessageId === message.id ? (
                        <IconCheck size={16} />
                      ) : (
                        <IconCopy size={16} />
                      )}
                    </StyledCopyButton>
                  )}
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </>
              ) : (
                message.content
              )}
            </StyledMessageContent>
          </StyledMessage>
        ))}

        {isLoading && (
          <StyledMessage role="assistant">
            <StyledMessageHeader>AI Assistant</StyledMessageHeader>
            <StyledShimmer>
              <StyledShimmerLine width="90%" />
              <StyledShimmerLine width="75%" />
              <StyledShimmerLine width="85%" />
            </StyledShimmer>
          </StyledMessage>
        )}
        <div ref={messagesEndRef} />
      </StyledMessagesContainer>

      {messages.length === 0 && (
        <StyledSuggestionsContainer>
          {SUGGESTIONS.map((suggestion, index) => (
            <StyledSuggestionChip
              key={index}
              onClick={() => handleSuggestionClick(suggestion.text)}
            >
              <suggestion.icon size={16} />
              {suggestion.text}
            </StyledSuggestionChip>
          ))}
        </StyledSuggestionsContainer>
      )}

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
