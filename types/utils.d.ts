import { AnimationConfig } from "interfaces";
export declare function applyPixelCompatibility(mesh: foundry.canvas.primary.PrimarySpriteMesh): void;
export declare function awaitTextureLoaded(texture: PIXI.Texture): Promise<void>;
export declare function animationEnd(resource: PIXI.VideoResource): Promise<void>;
/**
 * Attempts to determine the MIME type of a given file
 * @param {string} path - File name/path
 * @returns
 */
export declare function mimeType(path: string): string;
export declare function isVideo(path: string): boolean;
export declare function isImage(path: string): boolean;
export declare function generatePreviewTooltip(animation: AnimationConfig): HTMLElement;
export declare function downloadJSON(json: object, name: string): void;
export declare function uploadJSON<t = any>(): Promise<t>;
export declare function logImage(url: string, width?: number, height?: number): void;
