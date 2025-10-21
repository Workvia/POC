import styled from '@emotion/styled';

import { Select } from '@/ui/input/components/Select';
import { useFontSize } from '@/ui/theme/hooks/useFontSize';
import { type FontSize } from '@/ui/theme/states/persistedFontSizeState';
import { useLingui } from '@lingui/react/macro';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const FontSizePicker = () => {
  const { t } = useLingui();
  const { fontSize, setFontSize } = useFontSize();

  const fontSizeOptions = [
    {
      label: t`Smaller`,
      value: 'Smaller' as FontSize,
    },
    {
      label: t`Small`,
      value: 'Small' as FontSize,
    },
    {
      label: t`Default`,
      value: 'Default' as FontSize,
    },
    {
      label: t`Large`,
      value: 'Large' as FontSize,
    },
    {
      label: t`Larger`,
      value: 'Larger' as FontSize,
    },
  ];

  return (
    <StyledContainer>
      <Select
        dropdownId="font-size-select"
        dropdownWidthAuto
        fullWidth
        value={fontSize}
        options={fontSizeOptions}
        onChange={(value) => setFontSize(value as FontSize)}
      />
    </StyledContainer>
  );
};
