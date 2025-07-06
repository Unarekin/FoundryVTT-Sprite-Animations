import { LocalizedError } from "./LocalizedError";

export class InvalidAnimationError extends LocalizedError {
  constructor(anim: unknown) {
    super("INVALIDANIMATION", { animation: typeof anim === "string" ? anim : typeof anim === "object" ? JSON.stringify(anim) : typeof anim });
  }
}