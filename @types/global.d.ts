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