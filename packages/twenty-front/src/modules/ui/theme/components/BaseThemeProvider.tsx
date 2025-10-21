import { ThemeProvider } from '@emotion/react';
import { createContext, useMemo } from 'react';

import { persistedColorSchemeState } from '@/ui/theme/states/persistedColorSchemeState';
import { persistedFontSizeState } from '@/ui/theme/states/persistedFontSizeState';
import { applyFontSizeScale } from '@/ui/theme/utils/applyFontSizeScale';
import { getFontSizeMultiplier } from '@/ui/theme/utils/getFontSizeMultiplier';
import { useRecoilState, useRecoilValue } from 'recoil';
import { type ColorScheme } from 'twenty-ui/input';
import { THEME_DARK, THEME_LIGHT, ThemeContextProvider } from 'twenty-ui/theme';

type BaseThemeProviderProps = {
  children: JSX.Element | JSX.Element[];
};

export const ThemeSchemeContext = createContext<(theme: ColorScheme) => void>(
  () => {},
);

export const BaseThemeProvider = ({ children }: BaseThemeProviderProps) => {
  const [persistedColorScheme, setPersistedColorScheme] = useRecoilState(
    persistedColorSchemeState,
  );
  const persistedFontSize = useRecoilValue(persistedFontSizeState);

  document.documentElement.className =
    persistedColorScheme === 'Dark' ? 'dark' : 'light';

  const baseTheme = persistedColorScheme === 'Dark' ? THEME_DARK : THEME_LIGHT;
  const fontSizeMultiplier = getFontSizeMultiplier(persistedFontSize);

  const theme = useMemo(
    () => applyFontSizeScale(baseTheme, fontSizeMultiplier),
    [baseTheme, fontSizeMultiplier],
  );

  return (
    <ThemeSchemeContext.Provider value={setPersistedColorScheme}>
      <ThemeProvider theme={theme}>
        <ThemeContextProvider theme={theme}>{children}</ThemeContextProvider>
      </ThemeProvider>
    </ThemeSchemeContext.Provider>
  );
};
