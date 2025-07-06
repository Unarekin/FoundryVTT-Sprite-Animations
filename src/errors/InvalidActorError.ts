import { LocalizedError } from "./LocalizedError";

export class InvalidActorError extends LocalizedError {
  constructor(arg: unknown) {
    super("INVALIDACTOR", { actor: typeof arg === "string" ? arg : typeof arg });
  }
}