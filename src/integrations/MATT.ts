/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { InvalidAnimationError } from "errors";
import { AnimatedPlaceable } from "interfaces";

interface MATTAction<data> {
  id: string;
  action: string;
  data: data;
}

interface PlayActionData {
  animation: string;
  immediate: boolean;
}

(Hooks as any).on("setupTileActions", (app: any) => {
  app.registerTileGroup(__MODULE_ID__, game.i18n?.localize("SPRITE-ANIMATIONS.TITLE") ?? __MODULE_TITLE__);
  app.registerTileAction(__MODULE_ID__, "playAnimation", {
    name: game.i18n?.localize("SPRITE-ANIMATIONS.MATT.PLAY") ?? "",
    ctrls: [
      {
        id: "animation",
        name: "SPRITE-ANIMATIONS.MATT.ANIMATION",
        type: "list",
        required: true,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        list: async function (app: foundry.applications.api.HandlebarsApplicationMixin.AnyMixed, action: any, data: Record<string, unknown>) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const doc = (app as any).options?.parent?.document;
          if (!(doc instanceof TileDocument)) return Promise.resolve([]);

          const animatedTile = (doc.object) as unknown as AnimatedPlaceable;
          return Promise.resolve(animatedTile.spriteAnimations?.map(anim => ({ id: `${anim.id}|${anim.name}`, label: anim.name })) ?? []);
        }
      },
      {
        id: "immediate",
        name: "SPRITE-ANIMATIONS.MATT.IMMEDIATE",
        type: "checkbox"
      }
    ],
    group: __MODULE_ID__,
    content: function (trigger: any, action: MATTAction<PlayActionData>) {
      const animationName = action.data.animation.split("|")[1];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return `<span class="action-style">${game.i18n?.localize(trigger.name)}</span>, <span class="value-style">${animationName}</span>`
    },
    fn: async (args: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const doc: TileDocument = args.tile
      const tile = doc.object as unknown as AnimatedPlaceable;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const action: MATTAction<PlayActionData> = args.action;

      const id = action.data.animation.split("|")[0];
      const animation = tile.spriteAnimations.find(anim => anim.id === id);
      if (!animation) throw new InvalidAnimationError(id);
      if (action.data.immediate) await tile.playAnimation(animation);
      else await tile.queueAnimation(animation);
    }
  })
})