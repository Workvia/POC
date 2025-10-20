import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  flex: 1;
`;

export const WorkflowsCard = () => {
  return (
    <StyledContainer>
      <StyledIframe
        src="/objects/workflows?embed=true"
        title="Workflows"
        allow="clipboard-read; clipboard-write"
      />
    </StyledContainer>
  );
};
