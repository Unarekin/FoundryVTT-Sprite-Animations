export function coerceActor(arg: unknown): Actor | undefined {
  if (arg instanceof Actor) return arg;
  if (arg instanceof TokenDocument || arg instanceof foundry.canvas.placeables.Token) return arg.actor ?? undefined;
  if (typeof arg === "string") {
    const obj = fromUuidSync(arg);
    if (obj instanceof Actor) return obj;
    let actor = game.actors?.get(arg);
    if (actor instanceof Actor) return actor;
    actor = game.actors?.getName(arg);
    if (actor instanceof Actor) return actor;
  }
}