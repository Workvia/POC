import styled from '@emotion/styled';
import { useState } from 'react';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { IconAssistant } from '@/ui/display/icon/components/IconAssistant';
import { AssistantChatbot } from '@/assistant/components/AssistantChatbot';
import { IconSparkles, IconPlus, IconSearch } from 'twenty-ui/display';
import { useTheme } from '@emotion/react';

const StyledContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

const StyledSidebar = styled.div`
  width: 240px;
  background: ${({ theme }) => theme.background.secondary};
  border-right: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`;

const StyledSidebarHeader = styled.div`
  padding: 12px 12px 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StyledNewChatButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const StyledSearchInput = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: 14px;
  font-weight: 400;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const StyledChatList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
`;

const StyledChatListSection = styled.div`
  margin-bottom: 16px;
`;

const StyledSectionTitle = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 12px 4px;
  margin-bottom: 4px;
`;

const StyledChatItem = styled.button<{ isActive?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: ${({ theme, isActive }) =>
    isActive ? theme.background.transparent.medium : 'transparent'};
  border: none;
  border-radius: 6px;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 2px;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

const StyledChatItemText = styled.div`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const StyledSparkleIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledEmptyTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledEmptyDescription = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.tertiary};
  max-width: 200px;
`;

const StyledMainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

type ChatHistory = {
  id: string;
  title: string;
  timestamp: Date;
};

const truncateTitle = (title: string, maxLength: number = 25): string => {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength) + '...';
};

export const Assistant = () => {
  const theme = useTheme();
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const handleNewChat = () => {
    const newChat: ChatHistory = {
      id: Date.now().toString(),
      title: 'New chat',
      timestamp: new Date(),
    };
    setChatHistory([newChat, ...chatHistory]);
    setActiveChatId(newChat.id);
  };

  // Group chats by time period
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const todayChats = chatHistory.filter(
    (chat) => chat.timestamp.toDateString() === today.toDateString(),
  );
  const yesterdayChats = chatHistory.filter(
    (chat) => chat.timestamp.toDateString() === yesterday.toDateString(),
  );
  const lastWeekChats = chatHistory.filter(
    (chat) =>
      chat.timestamp > lastWeek &&
      chat.timestamp.toDateString() !== today.toDateString() &&
      chat.timestamp.toDateString() !== yesterday.toDateString(),
  );
  const olderChats = chatHistory.filter((chat) => chat.timestamp <= lastWeek);

  return (
    <PageContainer>
      <PageHeader title="Assistant" Icon={IconAssistant} />
      <PageBody>
        <StyledContainer>
          <StyledSidebar>
            <StyledSidebarHeader>
              <StyledNewChatButton type="button" onClick={handleNewChat}>
                <IconPlus size={18} />
                New chat
              </StyledNewChatButton>
              <StyledSearchInput type="button">
                <IconSearch size={18} />
                Search chats
              </StyledSearchInput>
            </StyledSidebarHeader>

            <StyledChatList>
              {chatHistory.length === 0 ? (
                <StyledEmptyState>
                  <StyledSparkleIcon>
                    <IconSparkles
                      size={theme.icon.size.md}
                      color={theme.font.color.tertiary}
                    />
                  </StyledSparkleIcon>
                  <StyledEmptyTitle>No chats yet</StyledEmptyTitle>
                  <StyledEmptyDescription>
                    Start a new conversation to see your chat history here
                  </StyledEmptyDescription>
                </StyledEmptyState>
              ) : (
                <>
                  {todayChats.length > 0 && (
                    <StyledChatListSection>
                      <StyledSectionTitle>Today</StyledSectionTitle>
                      {todayChats.map((chat) => (
                        <StyledChatItem
                          key={chat.id}
                          isActive={activeChatId === chat.id}
                          onClick={() => setActiveChatId(chat.id)}
                        >
                          <IconSparkles size={16} />
                          <StyledChatItemText>
                            {truncateTitle(chat.title)}
                          </StyledChatItemText>
                        </StyledChatItem>
                      ))}
                    </StyledChatListSection>
                  )}

                  {yesterdayChats.length > 0 && (
                    <StyledChatListSection>
                      <StyledSectionTitle>Yesterday</StyledSectionTitle>
                      {yesterdayChats.map((chat) => (
                        <StyledChatItem
                          key={chat.id}
                          isActive={activeChatId === chat.id}
                          onClick={() => setActiveChatId(chat.id)}
                        >
                          <IconSparkles size={16} />
                          <StyledChatItemText>
                            {truncateTitle(chat.title)}
                          </StyledChatItemText>
                        </StyledChatItem>
                      ))}
                    </StyledChatListSection>
                  )}

                  {lastWeekChats.length > 0 && (
                    <StyledChatListSection>
                      <StyledSectionTitle>Previous 7 Days</StyledSectionTitle>
                      {lastWeekChats.map((chat) => (
                        <StyledChatItem
                          key={chat.id}
                          isActive={activeChatId === chat.id}
                          onClick={() => setActiveChatId(chat.id)}
                        >
                          <IconSparkles size={16} />
                          <StyledChatItemText>
                            {truncateTitle(chat.title)}
                          </StyledChatItemText>
                        </StyledChatItem>
                      ))}
                    </StyledChatListSection>
                  )}

                  {olderChats.length > 0 && (
                    <StyledChatListSection>
                      <StyledSectionTitle>Older</StyledSectionTitle>
                      {olderChats.map((chat) => (
                        <StyledChatItem
                          key={chat.id}
                          isActive={activeChatId === chat.id}
                          onClick={() => setActiveChatId(chat.id)}
                        >
                          <IconSparkles size={16} />
                          <StyledChatItemText>
                            {truncateTitle(chat.title)}
                          </StyledChatItemText>
                        </StyledChatItem>
                      ))}
                    </StyledChatListSection>
                  )}
                </>
              )}
            </StyledChatList>
          </StyledSidebar>

          <StyledMainContent>
            <AssistantChatbot />
          </StyledMainContent>
        </StyledContainer>
      </PageBody>
    </PageContainer>
  );
};
