import { HUDButtonPosition } from "types";
import { AnimationFlags } from "interfaces"

declare global {
  declare const __DEV__: boolean;
  declare const __MODULE_TITLE__: string;
  // declare const __MODULE_ID__: string;
  const __MODULE_ID__ = "sprite-animations";
  declare const __MODULE_VERSION__: string;
}


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
  interface SettingConfig {
    "sprite-animations.animateOtherTokens": boolean;
    "sprite-animations.collapseHeaderButton": boolean;
    "sprite-animations.hudButtonPosition": HUDButtonPosition
  }

  interface FlagConfig {
    Actor: {
      [__MODULE_ID__]: AnimationFlags;
    },
    TileDocument: {
      [__MODULE_ID__]: AnimationFlags;
    }
  }
}
export { }