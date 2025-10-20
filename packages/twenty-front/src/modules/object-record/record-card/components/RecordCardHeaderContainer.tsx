import styled from '@emotion/styled';

export const StyledBoardCardHeaderContainer = styled.div<{
  isCompact: boolean;
}>`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  height: 28px;
  padding-bottom: ${({ theme, isCompact }) => theme.spacing(isCompact ? 3 : 2)};
  padding-left: ${({ theme }) => theme.spacing(4)};
  padding-right: ${({ theme }) => theme.spacing(4)};
  padding-top: ${({ theme }) => theme.spacing(4)};
  transition: padding ease-in-out 160ms;

  img {
    height: ${({ theme }) => theme.icon.size.md}px;
    object-fit: cover;
    width: ${({ theme }) => theme.icon.size.md}px;
    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
`;

export { StyledBoardCardHeaderContainer as RecordCardHeaderContainer };
