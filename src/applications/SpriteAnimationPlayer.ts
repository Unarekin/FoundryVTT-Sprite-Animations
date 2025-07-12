import { mimeType } from "utils";
import { TRANSLATION_KEY } from "../constants";
import { AnimationContext, AnimationPlayerRenderContext } from "./types";
import { AnimationConfig } from "interfaces";
import { SpriteAnimator } from "SpriteAnimator";
import { InvalidAnimationError } from "errors";

export class SpriteAnimationPlayer extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

  public readonly actor: Actor | null = null;

  static DEFAULT_OPTIONS = {
    window: {
      title: `${TRANSLATION_KEY}.PLAYER.TITLE`,
      icon: "fa-solid fa-person-running",
      contentClasses: ["standard-form"]
    },
    position: {
      width: 350
    },
    tag: "form",
    form: {
      closeOnSubmit: true,
    },
    actions: {

      // eslint-disable-next-line @typescript-eslint/unbound-method
      playAnimation: SpriteAnimationPlayer.PlayAnimation,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      queueAnimation: SpriteAnimationPlayer.QueueAnimation,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      removeQueueItem: SpriteAnimationPlayer.RemoveQueueItem,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      clearQueue: SpriteAnimationPlayer.ClearQueue,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      playQueue: SpriteAnimationPlayer.PlayQueue
    }
  }

  static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    body: {
      template: `modules/${__MODULE_ID__}/templates/animationPlayer.hbs`,
      templates: [
        `modules/${__MODULE_ID__}/templates/playerRow.hbs`,
        `modules/${__MODULE_ID__}/templates/animationPreview.hbs`
      ]
    },
    footer: {
      template: `templates/generic/form-footer.hbs`
    }
  }

  static async PlayQueue(this: SpriteAnimationPlayer) {
    try {
      if (!this.animationQueue.length) return;
      await SpriteAnimator.playAnimations(this.sprite, ...this.animationQueue);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  static async ClearQueue(this: SpriteAnimationPlayer) {
    try {
      const confirmed = await (foundry.applications.api.DialogV2.confirm({
        window: { title: game.i18n?.localize("Confirm") },
        content: `<p>${game.i18n?.localize(`${TRANSLATION_KEY}.PLAYER.CLEARCONFIRM`)}`
      }) as Promise<boolean>);
      if (!confirmed) return;

      this.animationQueue.splice(0, this.animationQueue.length);
      await this.updateQueue();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  static async RemoveQueueItem(this: SpriteAnimationPlayer, e: Event, elem: HTMLElement) {
    try {
      const index = parseInt(elem.dataset.animation ?? "");
      if (isNaN(index)) throw new InvalidAnimationError(index);

      this.animationQueue.splice(index, 1);
      await this.updateQueue();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  protected updateQueueButtons() {
    if (this.animationQueue.length) {
      const play = this.element.querySelector(`[data-action="playQueue"]`);
      if (play instanceof HTMLElement) play.classList.remove("disabled");
      const clear = this.element.querySelector(`[data-action="clearQueue"]`);
      if (clear instanceof HTMLElement) clear.classList.remove("disabled");
    } else {
      const play = this.element.querySelector(`[data-action="playQueue"]`);
      if (play instanceof HTMLElement) play.classList.add("disabled");
      const clear = this.element.querySelector(`[data-action="clearQueue"]`);
      if (clear instanceof HTMLElement) clear.classList.add("disabled");
    }
  }


  protected animationQueue: AnimationConfig[] = [];

  static async QueueAnimation(this: SpriteAnimationPlayer, e: Event, elem: HTMLElement) {
    try {
      const id = elem.dataset.animation;
      if (!id) throw new InvalidAnimationError(id);
      const animation = SpriteAnimator.getAnimation(this.sprite, id);
      if (!animation) throw new InvalidAnimationError(id);
      this.animationQueue.push(animation);
      await this.updateQueue();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  protected async updateQueue() {
    const list = this.element.querySelector(`[data-role="queue-list"]`);
    if (list instanceof HTMLElement) {
      const content = await renderTemplate(`modules/${__MODULE_ID__}/templates/playerQueue.hbs`, { queue: this.animationQueue });
      list.innerHTML = content;
    }
    this.updateQueueButtons();
  }

  static async PlayAnimation(this: SpriteAnimationPlayer, e: Event, elem: HTMLElement) {
    try {
      const id = elem.dataset.animation;
      if (!id) throw new InvalidAnimationError(id);
      const animation = SpriteAnimator.getAnimation(this.sprite as unknown, id);
      if (!animation) throw new InvalidAnimationError(id);
      await SpriteAnimator.playAnimation(this.sprite, id);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  protected parseAnimations(animations: AnimationConfig[]): AnimationContext[] {
    return animations.map(anim => ({
      ...anim,
      isVideo: mimeType(anim.src).split("/")[0] === "video"
    }));
  }

  async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<AnimationPlayerRenderContext> {
    const context = {
      ...(await super._prepareContext(options)),
      animations: this.parseAnimations(SpriteAnimator.getAnimations(this.sprite) ?? []),
      buttons: [
        { type: "submit", icon: "fa-solid fa-times", label: "Close" } as foundry.applications.api.ApplicationV2.FormFooterButton
      ]
    }

    return context;
  }

  constructor(public readonly sprite: Token | Tile, options?: foundry.applications.api.HandlebarsApplicationMixin.Configuration) {
    super(options);
    if (sprite instanceof Token) this.actor = sprite.actor;
  }
}