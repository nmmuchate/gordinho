/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2196F3';
const tintColorDark = '#4ECDC4';

export default {
  light: {
    text: '#000',
    background: '#F5F5F5',
    tint: tintColorLight,
    tabIconDefault: '#999',
    tabIconSelected: tintColorLight,
    card: '#FFF',
    border: '#E0E0E0',
  },
  dark: {
    text: '#FFF',
    background: '#121212',
    tint: tintColorDark,
    tabIconDefault: '#888',
    tabIconSelected: tintColorDark,
    card: '#1E1E1E',
    border: '#2C2C2C',
  },
};
