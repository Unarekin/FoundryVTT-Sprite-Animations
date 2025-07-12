import { AnimationConfig } from "interfaces";
import { getAnimation } from "settings";

export function coerceActor(arg: unknown): Actor | undefined {
  if (arg instanceof Actor) return arg;
  if (arg instanceof TokenDocument || arg instanceof Token) return arg.actor ?? undefined;
  if (typeof arg === "string") {
    const obj = fromUuidSync(arg as any);
    if (obj instanceof Actor) return obj;
    let actor = game.actors?.get(arg);
    if (actor instanceof Actor) return actor;
    actor = game.actors?.getName(arg);
    if (actor instanceof Actor) return actor;
  }
}

export function coerceToken(arg: unknown): Token | undefined {
  if (arg instanceof Token) return arg;
  if (arg instanceof TokenDocument) {
    if (arg.object instanceof Token) return arg.object;
    return canvas?.scene?.tokens.get(arg.id ?? "")?.object ?? undefined;
  }
  if (typeof arg === "string") {
    const obj = fromUuidSync(arg as any);
    if (obj instanceof Token) return obj;
    if (obj instanceof TokenDocument) return obj.object ?? undefined;
  }
}

export function coerceTile(arg: unknown): Tile | undefined {
  if (arg instanceof Tile) return arg;
  if (arg instanceof TileDocument) {
    if (arg.object instanceof Tile) return arg.object;
    return canvas?.scene?.tiles.get(arg.id ?? "")?.object ?? undefined;
  }

  if (typeof arg === "string") {
    const obj = fromUuidSync(arg as any);
    if (obj instanceof Tile) return obj;
    if (obj instanceof TileDocument) return obj.object ?? undefined;
  }
}

export function coerceSprite(arg: unknown): Tile | Token | undefined {
  if (arg instanceof Tile || arg instanceof Token) return arg;
  if (arg instanceof TileDocument || arg instanceof TokenDocument) {
    if (arg.object instanceof Tile || arg.object instanceof Token) return arg.object;
    if (arg instanceof TileDocument) return canvas?.scene?.tiles.get(arg.id ?? "")?.object ?? undefined;
    if (arg instanceof TokenDocument) return canvas?.scene?.tokens.get(arg.id ?? "")?.object ?? undefined;
  }

  if (typeof arg === "string") {
    const obj = fromUuidSync(arg as any);
    if (obj instanceof Tile || obj instanceof Token) return obj;
    if (obj instanceof TileDocument || obj instanceof TokenDocument) return obj.object ?? undefined;
  }
}

export function coerceAnimation(anim: string | AnimationConfig, target?: unknown): AnimationConfig | undefined {
  if (typeof anim === "object") return anim;

  if (typeof anim === "string") {
    const sprite = coerceSprite(target);
    if (!sprite) return;
    if (sprite instanceof Token && sprite.actor instanceof Actor) return getAnimation(sprite.actor, anim);
    else if (sprite instanceof Actor || sprite instanceof Tile || sprite instanceof TileDocument) return getAnimation(sprite, anim);
  }
}