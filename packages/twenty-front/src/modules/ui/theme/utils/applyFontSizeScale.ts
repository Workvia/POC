import { type Theme } from 'twenty-ui/theme';

export const applyFontSizeScale = (
  theme: Theme,
  multiplier: number,
): Theme => {
  const scaleFontSize = (fontSize: string): string => {
    const numericValue = parseFloat(fontSize);
    const unit = fontSize.replace(numericValue.toString(), '');
    return `${(numericValue * multiplier).toFixed(3)}${unit}`;
  };

  return {
    ...theme,
    font: {
      ...theme.font,
      size: {
        xxs: scaleFontSize(theme.font.size.xxs),
        xs: scaleFontSize(theme.font.size.xs),
        sm: scaleFontSize(theme.font.size.sm),
        md: scaleFontSize(theme.font.size.md),
        lg: scaleFontSize(theme.font.size.lg),
        xl: scaleFontSize(theme.font.size.xl),
        xxl: scaleFontSize(theme.font.size.xxl),
      },
    },
  };
};
