import { AnimationConfig, AnimationSequence } from "interfaces";

export type IsObject<T> = T extends Readonly<Record<string, any>>
  ? T extends AnyArray | AnyFunction
  ? false
  : true
  : false;

/**
 * Recursively sets keys of an object to optional. Used primarily for update methods
 * @internal
 */
export type DeepPartial<T> = T extends unknown
  ? IsObject<T> extends true
  ? {
    [P in keyof T]?: DeepPartial<T[P]>;
  }
  : T
  : T;

export type AnyArray = readonly unknown[];
export type AnyFunction = (arg0: never, ...args: never[]) => unknown;

export type AnimationArgument = string | AnimationConfig | AnimationSequence;

export const HUDButtonPositions = ["none", "left", "right"] as const;
export type HUDButtonPosition = typeof HUDButtonPositions[number];

export const AnimationQueueItemTypes = ["wait", "animation"] as const;
export type AnimationQueueItemType = typeof AnimationQueueItemTypes[number];