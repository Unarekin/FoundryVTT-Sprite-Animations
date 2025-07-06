import { TRANSLATION_KEY } from "../constants";

export class LocalizedError extends Error {
  constructor(key: string, args: Record<string, string> = {}) {
    if (key) super(game?.i18n?.format(`${TRANSLATION_KEY}.ERRORS.${key}`, args));
    else super();
  }
}