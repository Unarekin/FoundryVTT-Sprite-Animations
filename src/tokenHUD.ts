import { TRANSLATION_KEY } from "./constants";
import { SpriteAnimationPlayer } from "./applications";

Hooks.on("renderTokenHUD", (app: foundry.applications.hud.TokenHUD) => {
  const col = app.element.querySelector(`.col.left`);
  if (!(col instanceof HTMLElement)) return;

  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("control-icon");
  button.innerHTML = `<i class="fa-solid fa-person-running"></i>`;
  button.title = game.i18n?.localize(`${TRANSLATION_KEY}.HUD.PLAY`) ?? "";

  button.addEventListener("click", () => {
    void (new SpriteAnimationPlayer(app.object)).render({ force: true });
  })

  col?.appendChild(button);
})