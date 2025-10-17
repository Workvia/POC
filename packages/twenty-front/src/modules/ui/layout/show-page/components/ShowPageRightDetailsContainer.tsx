import styled from '@emotion/styled';
import { type ReactNode } from 'react';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';

const StyledOuterContainer = styled.div<{ isMobile: boolean }>`
  background: ${({ theme }) => theme.background.secondary};
  border-bottom-right-radius: 8px;
  border-left: ${({ theme, isMobile }) =>
    isMobile ? 'none' : `1px solid ${theme.border.color.medium}`};
  border-top-right-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  z-index: 10;
  width: 'auto';
`;

const StyledInnerContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ isMobile }) => (isMobile ? `100%` : '348px')};
`;

const StyledIntermediateContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: ${({ theme }) => theme.spacing(3)};
`;

export type ShowPageRightDetailsContainerProps = {
  forceMobile: boolean;
  children: ReactNode;
};

export const ShowPageRightDetailsContainer = ({
  forceMobile = false,
  children,
}: ShowPageRightDetailsContainerProps) => {
  const isMobile = useIsMobile() || forceMobile;
  return (
    <StyledOuterContainer isMobile={isMobile}>
      {isMobile ? (
        <StyledInnerContainer isMobile={isMobile}>
          {children}
        </StyledInnerContainer>
      ) : (
        <ScrollWrapper
          componentInstanceId={`scroll-wrapper-show-page-right-details-container`}
        >
          <StyledIntermediateContainer>
            <StyledInnerContainer isMobile={isMobile}>
              {children}
            </StyledInnerContainer>
          </StyledIntermediateContainer>
        </ScrollWrapper>
      )}
    </StyledOuterContainer>
  );
};
