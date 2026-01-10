import { DeepPartial } from "types";
import { PlayerRenderContext, PlayerConfiguration, PlayerRenderOptions } from "./types";
import { AnimatedPlaceable, AnimationConfig, AnimationFlags } from "interfaces";
import { InvalidAnimationError } from "errors";

export class AnimationPlayer extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2<PlayerRenderContext, PlayerConfiguration, PlayerRenderOptions>) {

  #animationQueue: AnimationConfig[] = [];

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    header: {
      template: `modules/${__MODULE_ID__}/templates/player/header.hbs`
    },
    queue: {
      template: `modules/${__MODULE_ID__}/templates/player/queue.hbs`
    },
    main: {
      template: `modules/${__MODULE_ID__}/templates/player/player.hbs`,
      scrollable: ['.animation-list']
    },
    footer: {
      template: `templates/generic/form-footer.hbs`
    }
  }

  public static DEFAULT_OPTIONS: DeepPartial<foundry.applications.api.ApplicationV2.Configuration> = {
    window: {
      title: "SPRITE-ANIMATIONS.PLAYER.TITLE",
      icon: `fa-solid fa-person-running`,
      contentClasses: ["standard-form", "animation-player", "flexcol"],
      resizable: true
    },
    position: {
      width: 500
    },
    actions: {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      close: AnimationPlayer.Close,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      openConfig: AnimationPlayer.OpenSpriteConfiguration,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      playAnimation: AnimationPlayer.PlayAnimation,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      queueAnimation: AnimationPlayer.QueueAnimation,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      addToQueue: AnimationPlayer.AddToQueue,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      removeFromQueue: AnimationPlayer.RemoveFromQueue,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      clearQueue: AnimationPlayer.ClearQueue,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      playQueue: AnimationPlayer.PlayQueue,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      queueQueue: AnimationPlayer.QueueQueue
    }
  }

  // #region Action handlers

  /** Closes the application  */
  public static async Close(this: AnimationPlayer) {
    await this.close();
  }

  protected getAnimationFromElement(elem: HTMLElement): AnimationConfig {
    const animationId = elem.dataset.animation;
    if (!animationId) throw new InvalidAnimationError(animationId);
    const animation = this.getAnimationFlags()?.animations?.find(anim => anim.id === animationId);
    if (!animation) throw new InvalidAnimationError(animationId);
    return animation;
  }


  public static async ClearQueue(this: AnimationPlayer) {
    try {
      this.#animationQueue.splice(0, this.#animationQueue.length);
      await this.render();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  public static async QueueQueue(this: AnimationPlayer) {
    try {
      await this.object.queueAnimations(...this.#animationQueue);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  public static async PlayQueue(this: AnimationPlayer) {
    try {
      await this.object.playAnimations(...this.#animationQueue);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  public static async QueueAnimation(this: AnimationPlayer, e: Event, elem: HTMLElement) {
    try {
      const animation = this.getAnimationFromElement(elem);
      await this.object.queueAnimation(animation);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  public static async RemoveFromQueue(this: AnimationPlayer, e: Event, elem: HTMLElement) {
    try {
      const id = elem.dataset.animation;
      if (!id) throw new InvalidAnimationError(id);
      const index = this.#animationQueue.findIndex(anim => anim.id === id);
      if (index === -1) throw new InvalidAnimationError(id);
      this.#animationQueue.splice(index, 1);
      await this.render();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  public static async AddToQueue(this: AnimationPlayer, e: Event, elem: HTMLElement) {
    try {
      const animation = this.getAnimationFromElement(elem);
      this.#animationQueue.push(animation);
      await this.render();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  public static async PlayAnimation(this: AnimationPlayer, e: Event, elem: HTMLElement) {
    try {
      const animation = this.getAnimationFromElement(elem);
      await this.object.playAnimation(animation);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Opens animation configuration tab for the current {@link AnimatedPlaceable}
   */
  public static async OpenSpriteConfiguration(this: AnimationPlayer) {
    try {
      if (!(this.object instanceof foundry.canvas.placeables.PlaceableObject)) return;

      // TODO: Ensure v12 compatibility here
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await (this.object.sheet as any).render({ force: true, tab: "animations" });

    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  // #endregion

  protected getAnimationFlags(): DeepPartial<AnimationFlags> | undefined { return this.object.getAnimationFlags(); }


  // #region Lifecycle Functions

  protected async _onFirstRender(context: PlayerRenderContext, options: PlayerRenderOptions) {
    await super._onFirstRender(context, options);

    const header = this.element.querySelector(`header.window-header`);
    if (header instanceof HTMLElement) {
      const configButton = document.createElement("a");
      // configButton.type = "button";
      configButton.dataset.tooltip = game.i18n?.localize("SPRITE-ANIMATIONS.PLAYER.CONFIG");
      configButton.dataset.action = "openConfig";
      configButton.classList.add("header-button", "control")

      const icon = document.createElement("i");
      icon.classList.add("fa-solid", "fa-gear");
      configButton.appendChild(icon);

      const closeButton = header.querySelector(`button[data-action="close"]`);
      if (closeButton instanceof HTMLElement)
        closeButton.insertAdjacentElement("beforebegin", configButton);
      else
        header.appendChild(configButton);
    }
  }

  protected async _prepareContext(options: PlayerRenderOptions): Promise<PlayerRenderContext> {
    const context = await super._prepareContext(options);

    context.idPrefix = foundry.utils.randomID();
    context.queue = foundry.utils.deepClone(this.#animationQueue);
    context.animations = (this.getAnimationFlags()?.animations ?? []).map(anim => {
      // Data from older versions of the module may not have IDs on the animations
      if (!anim.id) anim.id = foundry.utils.randomID();
      return anim;
    })


    context.buttons = [
      { type: "submit", icon: "fa-solid fa-times", label: "Close", action: "close" }
    ]

    return context;
  }


  // #endregion

  constructor(public readonly object: AnimatedPlaceable, options?: PlayerConfiguration) {
    super(options);
  }
}