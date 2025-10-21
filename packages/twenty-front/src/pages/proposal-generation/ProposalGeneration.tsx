import styled from '@emotion/styled';
import { IconFileText } from 'twenty-ui/display';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PagePanel } from '@/ui/layout/page/components/PagePanel';
import { ShowPageRightDetailsContainer } from '@/ui/layout/show-page/components/ShowPageRightDetailsContainer';
import { ProposalSidebar } from './components/ProposalSidebar';

const StyledContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  height: 100%;
  overflow: hidden;
`;

const StyledMainContent = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(8)};
  overflow-y: auto;
`;

export const ProposalGeneration = () => {
  return (
    <PageContainer>
      <PageHeader title="Proposal Generation" Icon={IconFileText} />
      <PageBody>
        <PagePanel>
          <StyledContentContainer>
            <StyledMainContent>
              <h2>Proposal Generation</h2>
              <p>Main content area</p>
            </StyledMainContent>
            <ShowPageRightDetailsContainer forceMobile={false}>
              <ProposalSidebar />
            </ShowPageRightDetailsContainer>
          </StyledContentContainer>
        </PagePanel>
      </PageBody>
    </PageContainer>
  );
};
