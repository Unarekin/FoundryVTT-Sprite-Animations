import { getSectionManager } from "./sequencer";
import { AnimatedTileMixin, AnimatedTokenMixin } from "./placeables";
import { TokenConfigMixin, TileConfigMixin } from "./applications"

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

Hooks.once("canvasReady", () => {
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