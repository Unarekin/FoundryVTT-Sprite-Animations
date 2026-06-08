import { AnimationPlayer } from "applications";
import { InvalidSpriteError } from "errors";
import { SETTINGS } from "settings";

function insertHUD(app: foundry.applications.hud.BasePlaceableHUD) {
  if (!(app.object instanceof foundry.canvas.placeables.Tile || app.object instanceof foundry.canvas.placeables.Token)) throw new InvalidSpriteError(app.object);

  const hudPosition = game.settings?.get(__MODULE_ID__, SETTINGS.hudButtonPosition) ?? "left";
  const hudPositionSelector = hudPosition === "left" ? ".col.left" : hudPosition === "right" ? ".col.right" : "";
  if (!hudPositionSelector) return;
  const col = app.element instanceof HTMLElement ? app.element.querySelector(hudPositionSelector) : (app.element as JQuery<HTMLElement>).find(hudPositionSelector)[0];

  if (!(col instanceof HTMLElement)) return;

  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("control-icon");
  const icon = document.createElement("i");
  icon.classList.add("fa-solid", "fa-person-running");
  // button.title = game.i18n?.localize("SPRITE-ANIMATIONS.HUD.PLAY") ?? "";
  button.dataset.tooltip = game.i18n?.localize("SPRITE-ANIMATIONS.HUD.PLAY") ?? "";

  button.appendChild(icon);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  button.addEventListener("click", () => { void new AnimationPlayer(app.object as any).render({ force: true }); });
  col.appendChild(button);
}

Hooks.on("renderTokenHUD", (app: foundry.applications.hud.TokenHUD) => { insertHUD(app); });
Hooks.on("renderTileHUD", (app: foundry.applications.hud.TileHUD) => { insertHUD(app); });