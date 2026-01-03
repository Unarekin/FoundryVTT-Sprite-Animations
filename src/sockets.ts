import { InvalidSpriteError, LocalizedError } from "errors";
import { AnimationConfig, PlaySocketMessage, QueueSocketMessage, SocketMessage } from "interfaces";
import { coerceSprite } from "coercion";
import { AnimationArgument } from "types";


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

async function doQueueAnimations(uuid: string, animations: AnimationArgument[]) {
  const sprite = coerceSprite(uuid);
  if (!sprite) throw new InvalidSpriteError(uuid)
    
  await sprite.queueAnimations(...animations);
}

async function doPlayAnimations(uuid: string, animations: AnimationArgument[]) {
  const sprite = coerceSprite(uuid);
  if (!sprite) throw new InvalidSpriteError(uuid);

  await sprite.playAnimations(...animations);
}
