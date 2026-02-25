declare const __DEV__: boolean;
declare const __MODULE_TITLE__: string;
// declare const __MODULE_ID__: string;
const __MODULE_ID__ = "sprite-animations";
declare const __MODULE_VERSION__: string;

declare const libWrapper: any;
declare const socketlib: any;

declare module '*.scss';

declare module '*.frag' {
  const content: string;
  export default content;
}

declare module '*.vert' {
  const content: string;
  export default content;
}

declare module "fvtt-types/configuration" {
  interface SettingsConfig {
    __MODULE_ID__: {
      animateOtherTokens: boolean;
    }
  }

  interface FlagConfig {
    Actor: {
      __MODULE_ID__: AnimationFlags;
    },
    TileDocument: {
      __MODULE_ID__: AnimationFlags;
    }
  }
}