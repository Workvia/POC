import styled from '@emotion/styled';
import { AssistantChatbot } from './AssistantChatbot';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const StyledInputWrapper = styled.div`
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 600px;
`;

export const AssistantCard = () => {
  return (
    <StyledContainer>
      <StyledInputWrapper>
        <AssistantChatbot isCardView={true} />
      </StyledInputWrapper>
    </StyledContainer>
  );
};
