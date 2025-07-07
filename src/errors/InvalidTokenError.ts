import { LocalizedError } from "./LocalizedError";

export class InvalidTokenError extends LocalizedError {
  constructor(token: unknown) {
    super("INVALIDTOKEN", { token: typeof token === "string" ? token : typeof token });
  }
}