import { atom } from 'recoil';

import { localStorageEffect } from '~/utils/recoil-effects';

export type FontSize = 'Smaller' | 'Small' | 'Default' | 'Large' | 'Larger';

export const persistedFontSizeState = atom<FontSize>({
  key: 'persistedFontSizeState',
  default: 'Default',
  effects: [localStorageEffect()],
});
