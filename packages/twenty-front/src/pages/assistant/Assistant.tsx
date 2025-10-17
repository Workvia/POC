import styled from '@emotion/styled';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { IconAssistant } from '@/ui/display/icon/components/IconAssistant';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${({ theme }) => theme.spacing(6)};
  width: 100%;
`;

const StyledTitle = styled.h1`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledDescription = styled.p`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  margin: 0;
`;

export const Assistant = () => {
  return (
    <PageContainer>
      <PageHeader title="Assistant" Icon={IconAssistant} />
      <PageBody>
        <StyledContainer>
          <StyledTitle>AI Assistant</StyledTitle>
          <StyledDescription>
            Your AI assistant will appear here.
          </StyledDescription>
        </StyledContainer>
      </PageBody>
    </PageContainer>
  );
};
