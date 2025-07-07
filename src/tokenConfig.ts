import { SpriteAnimationsConfig } from "./applications";

function getHeaderButtons(app: unknown): foundry.applications.api.ApplicationV2.HeaderControlsEntry[] {
  return [
    {
      icon: "fa-solid fa-person-running",
      label: "SPRITE-ANIMATIONS.CONFIG.HEADER",
      class: "sprite-animations",
      onClick: () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        void (new SpriteAnimationsConfig((app as any).actor as Actor)).render({ force: true });
      },
      onclick: () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        void (new SpriteAnimationsConfig((app as any).actor as Actor)).render({ force: true });
      }
    }
  ]
}

function addHeaderButton(app: unknown, controls: foundry.applications.api.ApplicationV2.HeaderControlsEntry[]) {
  controls.unshift(...getHeaderButtons(app));
}

["getHeaderControlsTokenConfig",
  "getHeaderControlsPrototypeTokenConfig",
  "getActorSheetHeaderButtons",
  "getHeaderControlsActorSheetV2",
  "getTokenConfigHeaderButtons"
].forEach(hook => {
  console.log("Setting hook:", hook);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  (Hooks as any).on(hook, (app: unknown, controls: foundry.applications.api.ApplicationV2.HeaderControlsEntry[]) => {
    console.log(hook, controls);
    addHeaderButton(app, controls);
  });
});