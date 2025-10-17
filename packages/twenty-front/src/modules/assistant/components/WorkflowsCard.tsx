import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/layout';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export const WorkflowsCard = () => {
  return (
    <StyledContainer>
      <AnimatedPlaceholderEmptyContainer
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
      >
        <AnimatedPlaceholder type="noNote" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            <Trans>No Workflows</Trans>
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            <Trans>There are no workflows associated with this record yet.</Trans>
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    </StyledContainer>
  );
};
