import { getSectionManager } from "./sequencer";
import { AnimatedTileMixin, AnimatedTokenMixin} from "./placeables";

Hooks.on("canvasReady", () => {
  if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (window as any).__PIXI_DEVTOOLS__ = {
      stage: canvas?.stage,
      renderer: canvas?.app?.renderer
    };
  }
});

Hooks.once("init", () => {
  CONFIG.Token.objectClass = AnimatedTokenMixin(CONFIG.Token.objectClass) as unknown as typeof foundry.canvas.placeables.Token;
  CONFIG.Tile.objectClass = AnimatedTileMixin(CONFIG.Tile.objectClass) as unknown as typeof foundry.canvas.placeables.Tile;
});


// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
(Hooks as any).on("sequencerReady", () => {
  const sectionClass = getSectionManager();
  Sequencer.SectionManager.registerSection(__MODULE_ID__, "spriteAnimation", sectionClass);
})