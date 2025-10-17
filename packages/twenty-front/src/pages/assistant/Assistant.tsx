import styled from '@emotion/styled';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { IconAssistant } from '@/ui/display/icon/components/IconAssistant';
import { AssistantChatbot } from '@/assistant/components/AssistantChatbot';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

export const Assistant = () => {
  return (
    <PageContainer>
      <PageHeader title="Assistant" Icon={IconAssistant} />
      <PageBody>
        <StyledContainer>
          <AssistantChatbot />
        </StyledContainer>
      </PageBody>
    </PageContainer>
  );
};
