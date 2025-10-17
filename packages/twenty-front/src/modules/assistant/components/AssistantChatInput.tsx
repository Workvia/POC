import styled from '@emotion/styled';
import { useState } from 'react';
import { IconPaperclip, IconChevronDown, IconSend } from 'twenty-ui/display';

const StyledInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 12px;
  padding: 20px;
`;

const StyledInputArea = styled.textarea`
  width: 100%;
  min-height: 60px;
  border: none;
  outline: none;
  background: transparent;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: 15px;
  font-family: inherit;
  resize: none;
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
  transition: background 0.2s;

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
  transition: background 0.2s;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.color.blue70};
  }
`;

export const AssistantChatInput = () => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      // TODO: Implement send message functionality
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <StyledInputWrapper>
      <StyledInputArea
        placeholder="Ask anything"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
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
        <StyledSendButton
          type="button"
          onClick={handleSend}
          disabled={!message.trim()}
        >
          <IconSend size={18} />
          Send
        </StyledSendButton>
      </StyledButtonRow>
    </StyledInputWrapper>
  );
};
