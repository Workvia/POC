import { type FontSize } from '@/ui/theme/states/persistedFontSizeState';

export const getFontSizeMultiplier = (fontSize: FontSize): number => {
  const multipliers: Record<FontSize, number> = {
    Smaller: 0.85,
    Small: 0.92,
    Default: 1,
    Large: 1.08,
    Larger: 1.15,
  };

  return multipliers[fontSize];
};
