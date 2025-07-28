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


Hooks.on("drawTile", (tile: Tile) => {
  applyMeshAdjustments(tile);
});

