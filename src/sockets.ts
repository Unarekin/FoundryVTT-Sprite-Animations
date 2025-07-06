import { InvalidActorError, InvalidAnimationError, InvalidTokenError, LocalizedError } from "errors";
import { AnimationConfig } from "interfaces";
import { playAnimations as utilPlayAnimations } from "./utils";
import { getAnimation } from "settings";
import { coerceToken } from "coercion";

let socket: any;

// Ensure hook is only registered once, even if file is included in multiple locations
let hooksRegistered = false;
if (!hooksRegistered) {
  // TODO: Actually get HookConfig working at all
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  (Hooks as any).once("socketlib.ready", () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    socket = socketlib.registerModule(__MODULE_ID__);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    socket.register("play", doPlayAnimations);

  });
  hooksRegistered = true;
}

export { socket };
export function playAnimations(tokenId: string, animations: (AnimationConfig | string)[]): void {
  if (!socket) throw new LocalizedError("SOCKETNOTINITIALIZED");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  socket.executeForOthers("play", tokenId, animations);
}

async function doPlayAnimations(uuid: string, animations: (AnimationConfig | string)[]) {
  // await SpriteAnimator.playAnimations(uuid, ...animations);
  // await utilPlayAnimations()
  const token = coerceToken(uuid);
  if (!(token instanceof Token)) throw new InvalidTokenError(uuid);
  if (!token.mesh) throw new InvalidTokenError(uuid);

  if (!(token.actor instanceof Actor)) throw new InvalidActorError(token.actor);
  const configs = animations.map(anim => typeof anim === "string" ? getAnimation(token.actor!, anim) : anim);
  const hasInvalid = configs.find(anim => !anim);
  if (hasInvalid) throw new InvalidAnimationError(hasInvalid);

  await utilPlayAnimations(token.mesh, animations as AnimationConfig[]);
}