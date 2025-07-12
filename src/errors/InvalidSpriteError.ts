import { LocalizedError } from "./LocalizedError";

export class InvalidSpriteError extends LocalizedError {
  constructor(sprite: unknown) {
    super("INVALIDSPRITE", { sprite: typeof sprite === "string" ? sprite : typeof sprite });
  }
}