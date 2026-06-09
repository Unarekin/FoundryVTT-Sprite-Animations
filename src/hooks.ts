import { getSectionManager } from "./sequencer";
import { AnimatedTileMixin, AnimatedTokenMixin } from "./placeables";
import { TokenConfigMixin, TileConfigMixin, PrototypeTokenConfigMixin } from "./applications"
import { AnimatedPlaceable } from "interfaces";
import { SETTINGS } from "./settings";
import * as systems from "./systems";
import { BaseSystemHandler } from "./systems";
import { log } from "utils";

Hooks.on("canvasReady", () => {
  if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (window as any).__PIXI_DEVTOOLS__ = {
      stage: canvas?.stage,
      renderer: canvas?.app?.renderer
    };
  }
});


function applyMixin(collection: Record<string, any>, mixin: any) {
  const entries = Object.entries(collection);
  for (const [key, { cls }] of entries) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const mixed = mixin(cls);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    collection[key].cls = mixed;
  }
}

Hooks.once("canvasConfig", () => {
  try {
    CONFIG.Token.objectClass = AnimatedTokenMixin(CONFIG.Token.objectClass) as unknown as typeof foundry.canvas.placeables.Token;
    CONFIG.Tile.objectClass = AnimatedTileMixin(CONFIG.Tile.objectClass) as unknown as typeof foundry.canvas.placeables.Tile;
  } catch (err) {
    console.error(err);
    if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
  }
});


Hooks.once("ready", () => {
  try {
    if (game.release?.isNewer("13")) {
      applyMixin(CONFIG.Token.sheetClasses.base, TokenConfigMixin)
      applyMixin(CONFIG.Tile.sheetClasses.base, TileConfigMixin);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      CONFIG.Token.prototypeSheetClass = PrototypeTokenConfigMixin(CONFIG.Token.prototypeSheetClass as any) as any;
    }

    if (game.settings?.get(__MODULE_ID__, SETTINGS.itemRollWrapper)) {
      const systemClass = Object.values(systems).find(system => system.systemId === game.system?.id);
      if (systemClass) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const system = new (systemClass as any)() as BaseSystemHandler;
        log(`Registering item handler for ${game.system.title}`);
        system.register();
      }
    }

  } catch (err) {
    console.error(err);
    if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
  }
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
(Hooks as any).on("sequencerReady", () => {
  const sectionClass = getSectionManager();
  Sequencer.SectionManager.registerSection(__MODULE_ID__, "spriteAnimation", sectionClass);
})

Hooks.on("updateToken", (doc: TokenDocument) => {
  if (doc.object) {
    const placeable = doc.object as unknown as AnimatedPlaceable;
    placeable.applyAnimationMeshAdjustments(placeable.animationMeshAdjustments, true);
  }
});

Hooks.on("updateActor", (doc: Actor) => {
  const tokens = doc.getActiveTokens() as unknown[] as AnimatedPlaceable[];
  for (const token of tokens) {
    token.applyAnimationMeshAdjustments(token.animationMeshAdjustments, true);
  }
});

Hooks.on("updateTile", (doc: TileDocument) => {
  if (doc.object) {
    const placeable = doc.object as unknown as AnimatedPlaceable;
    placeable.applyAnimationMeshAdjustments(placeable.animationMeshAdjustments, true);
  }
});