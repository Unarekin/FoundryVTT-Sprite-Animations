import { AnimationConfig } from "./interfaces";
/**
 * Preloads animation textures for smoother transitioning between multiple.
 * @param {AnimationConfig[]} animations = {@link AnimationConfig}[]
 */
export declare function preloadTextures(...animations: AnimationConfig[]): Promise<void>;
export declare function playAnimation(mesh: foundry.canvas.primary.PrimarySpriteMesh, config: AnimationConfig): Promise<void>;
export declare function playAnimations(mesh: foundry.canvas.primary.PrimarySpriteMesh, configs: AnimationConfig[]): Promise<void>;
export declare function queueAnimation(mesh: foundry.canvas.primary.PrimarySpriteMesh, config: AnimationConfig): Promise<void>;
export declare function queueAnimations(mesh: foundry.canvas.primary.PrimarySpriteMesh, configs: AnimationConfig[]): Promise<void>;
export declare function animationEnd(resource: PIXI.VideoResource): Promise<void>;
/**
 * Attempts to determine the MIME type of a given file
 * @param {string} path - File name/path
 * @returns
 */
export declare function mimeType(path: string): string;
export declare function isVideo(path: string): boolean;
export declare function isImage(path: string): boolean;
