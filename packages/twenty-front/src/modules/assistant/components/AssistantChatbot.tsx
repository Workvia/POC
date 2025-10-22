import styled from '@emotion/styled';
import { IconPaperclip, IconChevronDown, IconSend, IconPlus, IconCheck, IconCopy, IconSearch, IconX, IconWorld } from 'twenty-ui/display';
import { useState, useRef, useEffect } from 'react';
import Markdown from 'markdown-to-jsx';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { getLogoUrlFromDomainName } from 'twenty-shared/utils';
import { getCompanyDomainName } from '@/object-metadata/utils/getCompanyDomainName';

type SelectedItem = {
  id: string;
  name: string;
  type: 'company' | 'file';
  logo?: string;
};

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
    background: transparent;
    color: ${theme.font.color.primary};
    border: none;
    padding-right: 48px;
  `}

  /* Markdown styling - AI SDK Elements / Streamdown exact styles */

  /* Headings */
  h1 {
    margin-top: ${({ theme }) => theme.spacing(6)};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    font-weight: 600;
    font-size: 1.875rem;
    line-height: 2.25rem;

    &:first-child {
      margin-top: 0;
    }
  }

  h2 {
    margin-top: ${({ theme }) => theme.spacing(6)};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 2rem;

    &:first-child {
      margin-top: 0;
    }
  }

  h3 {
    margin-top: ${({ theme }) => theme.spacing(6)};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    font-weight: 600;
    font-size: 1.25rem;
    line-height: 1.75rem;

    &:first-child {
      margin-top: 0;
    }
  }

  h4 {
    margin-top: ${({ theme }) => theme.spacing(6)};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    font-weight: 600;
    font-size: 1.125rem;
    line-height: 1.75rem;

    &:first-child {
      margin-top: 0;
    }
  }

  h5 {
    margin-top: ${({ theme }) => theme.spacing(6)};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    font-weight: 600;
    font-size: 1rem;
    line-height: 1.5rem;

    &:first-child {
      margin-top: 0;
    }
  }

  h6 {
    margin-top: ${({ theme }) => theme.spacing(6)};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.25rem;

    &:first-child {
      margin-top: 0;
    }
  }

  /* Paragraphs */
  p {
    margin: 0;

    & + p {
      margin-top: ${({ theme }) => theme.spacing(4)};
    }

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  /* Lists */
  ul, ol {
    margin-left: ${({ theme }) => theme.spacing(4)};
    list-style-position: outside;
    white-space: normal;
    margin-top: 0;
    margin-bottom: 0;

    & + p {
      margin-top: ${({ theme }) => theme.spacing(4)};
    }
  }

  ul {
    list-style-type: disc;
  }

  ol {
    list-style-type: decimal;
  }

  li {
    padding-top: ${({ theme }) => theme.spacing(1)};
    padding-bottom: ${({ theme }) => theme.spacing(1)};
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
  padding: 16px 16px 10px 16px;
  margin: 16px 24px 12px 24px;
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
  justify-content: center;
  gap: 6px;
  height: 32px;
  padding: 0 14px;
  background: ${({ theme }) => theme.background.transparent.light};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 50px;
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.medium};
    border-color: ${({ theme }) => theme.border.color.strong};
  }

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

const StyledSendButton = styled.button<{ disabled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 20px;
  background: ${({ theme, disabled }) =>
    disabled ? theme.background.transparent.medium : theme.color.blue};
  border: ${({ theme, disabled }) =>
    disabled ? `1px solid ${theme.border.color.medium}` : 'none'};
  border-radius: 50px;
  color: ${({ theme, disabled }) =>
    disabled ? theme.font.color.tertiary : 'white'};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.color.blue70};
    transform: scale(1.02);
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

// Popover Container
const StyledPopoverContainer = styled.div`
  position: relative;
`;

// Popover - min-w-[240px] space-y-1 p-2.5 px-1.5 text-sm
const StyledPopover = styled.div<{ isOpen: boolean }>`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  width: 300px;
  background: ${({ theme }) => theme.background.noisy};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 8px 6px;
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  flex-direction: column;
  gap: 2px;
  z-index: 1000;
  font-size: 14px;
`;

// text-secondary-foreground/55 mb-2 px-1 text-xs font-medium
const StyledPopoverHeader = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  opacity: 0.55;
  margin-bottom: 4px;
  margin-top: 8px;
  padding: 0 4px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.3px;

  &:first-of-type {
    margin-top: 4px;
  }
`;

// flex cursor-pointer items-center gap-2 px-1 py-1
const StyledPopoverItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 4px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: ${({ theme }) => theme.font.color.primary};
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
`;

// Switch component
const StyledSwitch = styled.input`
  appearance: none;
  width: 36px;
  height: 20px;
  margin-left: auto;
  background: ${({ theme }) => theme.background.transparent.medium};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    background: white;
    border-radius: 50%;
    transition: all 0.2s;
  }

  &:checked {
    background: ${({ theme }) => theme.color.blue};
    border-color: ${({ theme }) => theme.color.blue};

    &::after {
      left: 18px;
    }
  }
`;

// Input - mt-1.5
const StyledSearchInput = styled.input`
  width: 100%;
  max-width: 100%;
  padding: 7px 10px;
  margin-top: 6px;
  background: ${({ theme }) => theme.background.transparent.light};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 8px;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: 13px;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: ${({ theme }) => theme.color.blue};
  }

  &::placeholder {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

// Company/File list item with avatar
const StyledListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledAvatar = styled.div<{ src?: string }>`
  width: 16px;
  height: 16px;
  border-radius: 2px;
  background: ${({ theme, src }) =>
    src ? `url(${src}) center/cover` : theme.background.transparent.medium};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledListItemName = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.font.color.primary};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Chips container
const StyledChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
`;

// Individual chip - styled like file attachment
const StyledChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.background.transparent.light};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 12px;
  font-size: 13px;
  color: ${({ theme }) => theme.font.color.primary};
  width: fit-content;
  max-width: 280px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
`;

const StyledChipContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
`;

const StyledChipAvatar = styled.div<{ src?: string }>`
  width: 20px;
  height: 20px;
  border-radius: 3px;
  background: ${({ theme, src }) =>
    src ? `url(${src}) center/cover` : theme.background.transparent.medium};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledChipName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledChipRemove = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: ${({ theme }) => theme.font.color.tertiary};
  opacity: 0.6;
  flex-shrink: 0;
  border-radius: 4px;
  transition: all 0.15s;

  &:hover {
    opacity: 1;
    background: ${({ theme }) => theme.background.transparent.light};
    color: ${({ theme }) => theme.font.color.primary};
  }

  svg {
    width: 14px;
    height: 14px;
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
  // Use AI SDK useChat hook with proper transport and protocol
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: 'http://localhost:3002/api/chat',
    }),
    streamProtocol: 'data', // AI SDK v5 uses data stream protocol
  });

  // Manual input state (new AI SDK v5 doesn't include input management)
  const [input, setInput] = useState('');
  const isLoading = status === 'in_progress';

  // Helper function to extract text content from UIMessage format
  const getMessageText = (message: any) => {
    if (message.content) return message.content; // Old format
    if (message.parts) {
      // New AI SDK v5 format with parts array
      return message.parts
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('');
    }
    return '';
  };

  // Additional UI state
  const [expandedReasoning, setExpandedReasoning] = useState<Set<string>>(new Set());
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showSourcesPopup, setShowSourcesPopup] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [appsAndIntegrations, setAppsAndIntegrations] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fetch companies from twenty-backend
  const { records: companies = [] } = useFindManyRecords({
    objectNameSingular: 'company',
    limit: 50,
  });

  const handleSelectCompany = (company: any) => {
    const logoUrl = getLogoUrlFromDomainName(getCompanyDomainName(company) ?? '');
    const newItem: SelectedItem = {
      id: company.id,
      name: company.name,
      type: 'company',
      logo: logoUrl,
    };
    setSelectedItems(prev => [...prev, newItem]);
    setShowSourcesPopup(false);
  };

  const handleSelectFile = (file: any) => {
    const newItem: SelectedItem = {
      id: file.id,
      name: file.name,
      type: 'file',
    };
    setSelectedItems(prev => [...prev, newItem]);
    setShowSourcesPopup(false);
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowSourcesPopup(false);
      }
    };

    if (showSourcesPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSourcesPopup]);

  // Mock files data (files API integration to be implemented)
  useEffect(() => {
    setFiles([
      { id: '1', name: 'Q4 Report.pdf', type: 'pdf' },
      { id: '2', name: 'Meeting Notes.docx', type: 'doc' },
      { id: '3', name: 'Budget 2025.xlsx', type: 'xlsx' },
    ]);
  }, []);

  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input?.trim() || isLoading) return;

    sendMessage({ text: input.trim() });
    setInput(''); // Clear input after sending
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
      const response = await fetch('http://localhost:3002/api/chat', {
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
                  {getMessageText(message) && (
                    <StyledCopyButton
                      copied={copiedMessageId === message.id}
                      data-tooltip={copiedMessageId === message.id ? 'Copied!' : 'Copy'}
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(getMessageText(message));
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
                  <Markdown>
                    {getMessageText(message)}
                  </Markdown>
                </>
              ) : (
                getMessageText(message)
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

      <form onSubmit={handleSubmit}>
        <StyledInputWrapper>
          {selectedItems.length > 0 && (
            <StyledChipsContainer>
              {selectedItems.map((item) => (
                <StyledChip key={item.id}>
                  <StyledChipContent>
                    {item.logo ? (
                      <StyledChipAvatar src={item.logo} />
                    ) : (
                      <StyledChipAvatar>
                        {item.type === 'file' ? 'F' : item.name.charAt(0)}
                      </StyledChipAvatar>
                    )}
                    <StyledChipName>{item.name}</StyledChipName>
                  </StyledChipContent>
                  <StyledChipRemove
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <IconX />
                  </StyledChipRemove>
                </StyledChip>
              ))}
            </StyledChipsContainer>
          )}
          <StyledInputArea
            placeholder="Ask anything..."
            value={input || ''}
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
                <IconPaperclip size={16} />
                Attach
              </StyledButton>
              <StyledPopoverContainer>
                <StyledButton
                  type="button"
                  onClick={() => setShowSourcesPopup(!showSourcesPopup)}
                >
                  <IconWorld size={16} />
                  Sources
                </StyledButton>

                <StyledPopover isOpen={showSourcesPopup} ref={popoverRef}>
                  <StyledPopoverHeader>Sources</StyledPopoverHeader>

                  <StyledPopoverItem>
                    <IconSearch size={18} />
                    Web search
                    <StyledSwitch
                      type="checkbox"
                      checked={webSearch}
                      onChange={(e) => setWebSearch(e.target.checked)}
                    />
                  </StyledPopoverItem>

                  <StyledPopoverItem>
                    <IconSearch size={18} />
                    Apps and integrations
                    <StyledSwitch
                      type="checkbox"
                      checked={appsAndIntegrations}
                      onChange={(e) => setAppsAndIntegrations(e.target.checked)}
                    />
                  </StyledPopoverItem>

                  <StyledSearchInput
                    type="text"
                    placeholder="Search clients, files..."
                  />

                  <StyledPopoverHeader>Clients</StyledPopoverHeader>
                  {companies.map((company) => {
                    const logoUrl = getLogoUrlFromDomainName(getCompanyDomainName(company) ?? '');
                    return (
                      <StyledListItem key={company.id} onClick={() => handleSelectCompany(company)}>
                        <StyledAvatar src={logoUrl}>
                          {!logoUrl && company.name?.charAt(0)}
                        </StyledAvatar>
                        <StyledListItemName>{company.name}</StyledListItemName>
                      </StyledListItem>
                    );
                  })}

                  <StyledPopoverHeader>Files</StyledPopoverHeader>
                  {files.map((file) => (
                    <StyledListItem key={file.id} onClick={() => handleSelectFile(file)}>
                      <StyledAvatar>
                        {file.type.toUpperCase().substring(0, 3)}
                      </StyledAvatar>
                      <StyledListItemName>{file.name}</StyledListItemName>
                    </StyledListItem>
                  ))}
                </StyledPopover>
              </StyledPopoverContainer>
            </StyledLeftButtons>
            <StyledSendButton type="submit" disabled={!input?.trim() || isLoading}>
              {isLoading ? 'Sending...' : 'Send'}
            </StyledSendButton>
          </StyledButtonRow>
        </StyledInputWrapper>
      </form>
    </StyledChatContainer>
  );
};
