import { useRecoilState } from 'recoil';

import {
  type FontSize,
  persistedFontSizeState,
} from '@/ui/theme/states/persistedFontSizeState';

export const useFontSize = () => {
  const [fontSize, setFontSize] = useRecoilState(persistedFontSizeState);

  return {
    fontSize,
    setFontSize,
  };
};
