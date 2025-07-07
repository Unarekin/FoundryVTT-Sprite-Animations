import { SpriteAnimationsConfig } from "./applications";



// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
(Hooks as any).on("getHeaderControlsTokenConfig", (app: foundry.applications.sheets.TokenConfig, controls: foundry.applications.api.ApplicationV2.HeaderControlsEntry[]) => {
  controls.push({
    icon: "fa-solid fa-person-running",
    label: "SPRITE-ANIMATIONS.CONFIG.HEADER",
    onClick: () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      void (new SpriteAnimationsConfig((app as any).actor as Actor)).render({ force: true });

    }
  });
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
(Hooks as any).on("getHeaderControlsPrototypeTokenConfig", (app: foundry.applications.sheets.TokenConfig, controls: foundry.applications.api.ApplicationV2.HeaderControlsEntry[]) => {
  controls.push({
    icon: "fa-solid fa-person-running",
    label: "SPRITE-ANIMATIONS.CONFIG.HEADER",
    onClick: () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      void (new SpriteAnimationsConfig((app as any).actor as Actor)).render({ force: true });

    }
  });
});