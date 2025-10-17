import styled from '@emotion/styled';
import { AssistantChatbot } from './AssistantChatbot';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

export const AssistantCard = () => {
  return (
    <StyledContainer>
      <AssistantChatbot />
    </StyledContainer>
  );
};
