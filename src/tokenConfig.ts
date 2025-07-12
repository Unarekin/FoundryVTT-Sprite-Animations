import { SpriteAnimationsConfig } from "./applications";

function getHeaderButtons(app: unknown): foundry.applications.api.ApplicationV2.HeaderControlsEntry[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return [
    {
      icon: "fa-solid fa-person-running",
      label: "SPRITE-ANIMATIONS.CONFIG.HEADER",
      class: "sprite-animations",
      onClick: () => {
        if (app instanceof TileConfig) void (new SpriteAnimationsConfig(app.document)).render({ force: true });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        else void (new SpriteAnimationsConfig((app as any).actor as Actor)).render({ force: true });
      },
      onclick: () => {
        if (app instanceof TileConfig) void (new SpriteAnimationsConfig(app.document)).render({ force: true });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        else void (new SpriteAnimationsConfig((app as any).actor as Actor)).render({ force: true });
      }
    } as any
  ]
}

function addHeaderButton(app: unknown, controls: foundry.applications.api.ApplicationV2.HeaderControlsEntry[]) {
  console.log("Adding header button:", app);
  controls.unshift(...getHeaderButtons(app));
}

["getHeaderControlsTokenConfig",
  "getHeaderControlsTileConfig",
  "getHeaderControlsPrototypeTokenConfig",
  "getActorSheetHeaderButtons",
  "getHeaderControlsActorSheetV2",
  "getTokenConfigHeaderButtons",

].forEach(hook => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  (Hooks as any).on(hook, (app: unknown, controls: foundry.applications.api.ApplicationV2.HeaderControlsEntry[]) => {
    addHeaderButton(app, controls);
  });
});