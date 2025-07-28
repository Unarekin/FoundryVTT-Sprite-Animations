import { InvalidAnimationError, InvalidSpriteError, LocalizedError } from "errors";
import { AnimationConfig, PlaySocketMessage, QueueSocketMessage, SocketMessage } from "interfaces";
import { playAnimations as utilPlayAnimations, queueAnimations as utilQueueAnimations } from "./utils";
import { coerceAnimation, coerceSprite } from "coercion";


// let socket: any;

const SOCKET_IDENTIFIER = `module.${__MODULE_ID__}`;

Hooks.once("ready", () => {

  if (!game.socket) throw new LocalizedError("SOCKETNOTINITIALIZED");

  game.socket.on(SOCKET_IDENTIFIER, (message: SocketMessage) => {
    // Early exit
    if (!message.users.includes((game.user as User).id ?? "")) return;

    switch (message.type) {
      case "play": {
        const msg = message as PlaySocketMessage;
        doPlayAnimations(msg.target, msg.animations).catch((err: Error) => { ui.notifications?.error(err.message, { localize: true }) });
        break;
      }
      case "queue": {
        const msg = message as QueueSocketMessage;
        doQueueAnimations(msg.target, msg.animations).catch((err: Error) => { ui.notifications?.error(err.message, { localize: true }) });
        break;
      }
    }
  })
})


function createMessage<t extends SocketMessage = SocketMessage>(message: Partial<t>): t {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    id: foundry.utils.randomID(),
    timestamp: Date.now(),
    sender: game.user?.id ?? "",
    ...message
  } as any;
}


export function playAnimations(spriteId: string, animations: (AnimationConfig | string)[]): void {
  if (!game.socket) throw new LocalizedError("SOCKETNOTINITIALIZED");
  const msg = createMessage<PlaySocketMessage>({
    type: "play",
    target: spriteId,
    users: game.users?.filter(user => user.active).map(user => user.id),
    animations
  });

  game.socket.emit(SOCKET_IDENTIFIER, msg);
}

export function queueAnimations(spriteId: string, animations: (AnimationConfig | string)[]): void {
  if (!game.socket) throw new LocalizedError("SOCKETNOTINITIALIZED");
  const msg = createMessage<QueueSocketMessage>({
    type: "queue",
    target: spriteId,
    users: game.users?.filter(user => user.active).map(user => user.id),
    animations
  });

  game.socket.emit(SOCKET_IDENTIFIER, msg);


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
