import { InvalidAnimationError, InvalidSpriteError, LocalizedError } from "errors";
import { AnimationConfig } from "interfaces";
import { playAnimations as utilPlayAnimations, queueAnimations as utilQueueAnimations } from "./utils";
import { coerceAnimation, coerceSprite } from "coercion";

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    socket.register("queue", doQueueAnimations);
  });
  hooksRegistered = true;
}

export { socket };
export function playAnimations(spriteId: string, animations: (AnimationConfig | string)[]): void {
  if (!socket) throw new LocalizedError("SOCKETNOTINITIALIZED");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  socket.executeForOthers("play", spriteId, animations);
}

async function doQueueAnimations(uuid: string, animations: (AnimationConfig | string)[]) {
  const sprite = coerceSprite(uuid);
  if (!sprite?.mesh) throw new InvalidSpriteError(uuid);

  const configs = animations.map(anim => coerceAnimation(anim, sprite));
  const hasInvalid = configs.find(anim => !anim);
  if (hasInvalid) throw new InvalidAnimationError(hasInvalid);

  await utilQueueAnimations(sprite.mesh, animations as AnimationConfig[]);
}

async function doPlayAnimations(uuid: string, animations: (AnimationConfig | string)[]) {
  const sprite = coerceSprite(uuid);
  if (!sprite?.mesh) throw new InvalidSpriteError(uuid);

  const configs = animations.map(anim => coerceAnimation(anim, sprite));
  const hasInvalid = configs.find(anim => !anim);
  if (hasInvalid) throw new InvalidAnimationError(hasInvalid);

  await utilPlayAnimations(sprite.mesh, animations as AnimationConfig[]);
}

export function queueAnimations(spriteId: string, animations: (AnimationConfig | string)[]): void {
  if (!socket) throw new LocalizedError("SOCKETNOTINITIALIZED");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  socket.executeForOthers("queue", spriteId, animations);
}