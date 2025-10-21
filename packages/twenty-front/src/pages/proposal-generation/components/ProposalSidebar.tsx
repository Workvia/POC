import styled from '@emotion/styled';
import { useState } from 'react';
import { Button } from 'twenty-ui/input';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { DetailsTab } from './DetailsTab';
import { TemplateSettingsTab } from './TemplateSettingsTab';

const StyledSidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 100px);
`;

const StyledTabContent = styled.div`
  flex: 1;
  padding: 0 ${({ theme }) => theme.spacing(3)};
`;

const StyledButtonContainer = styled.div`
  margin-top: auto;
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(3)};
  padding-bottom: 0;
  background: ${({ theme }) => theme.background.secondary};
`;

const StyledButton = styled(Button)`
  background: ${({ theme }) => theme.name === 'dark' ? '#FFFFFF' : '#000000'};
  color: ${({ theme }) => theme.name === 'dark' ? '#000000' : '#FFFFFF'};
  justify-content: center;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.border.color.medium};

  &:hover {
    background: ${({ theme }) => theme.name === 'dark' ? '#F5F5F5' : '#1A1A1A'};
  }
`;

const PROPOSAL_SIDEBAR_TABS_ID = 'proposal-sidebar-tabs';

export const ProposalSidebar = () => {
  const [activeTabId, setActiveTabId] = useState('details');

  const tabs = [
    {
      id: 'details',
      title: 'Details',
    },
    {
      id: 'template-settings',
      title: 'Template settings',
    },
  ];

  return (
    <StyledSidebarContainer>
      <TabList
        tabs={tabs}
        componentInstanceId={PROPOSAL_SIDEBAR_TABS_ID}
        behaveAsLinks={false}
        onChangeTab={setActiveTabId}
      />

      <StyledTabContent>
        {activeTabId === 'details' && <DetailsTab />}
        {activeTabId === 'template-settings' && <TemplateSettingsTab />}
      </StyledTabContent>

      <StyledButtonContainer>
        <StyledButton variant="primary" title="Generate" fullWidth />
      </StyledButtonContainer>
    </StyledSidebarContainer>
  );
};
