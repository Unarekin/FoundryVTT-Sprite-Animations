import { TRANSLATION_KEY } from "./constants";
import { SpriteAnimationPlayer } from "./applications";

Hooks.on("renderTokenHUD", (app: foundry.applications.hud.TokenHUD) => {

  const col = app.element instanceof HTMLElement ? app.element.querySelector(`.col.left`) : (app.element as JQuery<HTMLElement>).find(`.col.left`)[0];
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