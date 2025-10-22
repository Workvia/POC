import styled from '@emotion/styled';
import { DocumentsDrawer } from '@/documents/components/DocumentsDrawer';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  height: 100%;
`;

export const PageContainer = ({ children }: React.PropsWithChildren) => {
  return (
    <StyledContainer>
      <DocumentsDrawer />
      {children}
    </StyledContainer>
  );
};
