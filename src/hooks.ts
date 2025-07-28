import { getSectionManager } from "./sequencer";
import { applyMeshAdjustments } from "settings";

Hooks.on("canvasReady", () => {
  if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (window as any).__PIXI_DEVTOOLS__ = {
      stage: canvas?.stage,
      renderer: canvas?.app?.renderer
    };
  }
});


Hooks.on("refreshToken", (token: Token) => {
  applyMeshAdjustments(token);
});


Hooks.on("refreshTile", (tile: Tile) => {
  applyMeshAdjustments(tile);
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
(Hooks as any).on("sequencerReady", () => {

  const sectionClass = getSectionManager();
  Sequencer.SectionManager.registerSection(__MODULE_ID__, "spriteAnimation", sectionClass);
})