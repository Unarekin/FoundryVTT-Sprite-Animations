import { AnimationConfig } from "interfaces";
export declare function coerceActor(arg: unknown): Actor | undefined;
export declare function coerceToken(arg: unknown): Token | undefined;
export declare function coerceTile(arg: unknown): Tile | undefined;
export declare function coerceSprite(arg: unknown): Tile | Token | undefined;
export declare function coerceAnimation(anim: string | AnimationConfig, target?: unknown): AnimationConfig | undefined;
export declare function coerceAnimatable(arg: unknown): Actor | Tile | TileDocument | undefined;
