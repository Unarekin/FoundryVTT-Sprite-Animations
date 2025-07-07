import { AnimationConfigRenderContext } from "./types";
import { InvalidAnimationError } from "errors";
import { TRANSLATION_KEY } from "../constants";
import { AnimationConfig } from "interfaces";
import { SpriteAnimator } from "SpriteAnimator";
import { mimeType } from "utils";
import { setAnimations } from "settings";

type AnimationContext = (AnimationConfig & { isVideo: boolean });

export class SpriteAnimationsConfig extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  static DEFAULT_OPTIONS = {
    window: {
      title: "SPRITE-ANIMATIONS.CONFIG.HEADER",
      icon: "fa-solid fa-person-running",
      contentClasses: ["standard-form"]
    },
    tag: "form",
    form: {
      closeOnSubmit: true,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      handler: SpriteAnimationsConfig.onSubmit
    },
    actions: {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      deleteAnimation: SpriteAnimationsConfig.DeleteAnimation,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      addAnimation: SpriteAnimationsConfig.AddAnimation
    }
  }

  static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    body: {
      template: `modules/${__MODULE_ID__}/templates/animationConfig.hbs`,
      templates: [`modules/${__MODULE_ID__}/templates/animationRow.hbs`]
    },
    footer: {
      template: `templates/generic/form-footer.hbs`
    }
  }


  protected animations: AnimationContext[] = [];


  public static async AddAnimation(this: SpriteAnimationsConfig): Promise<void> {
    try {
      // Check for empty animation
      const hasEmpty = this.animations.some(anim => !anim.name);
      if (hasEmpty) return;

      this.animations.push({ name: "", src: "", loop: false, isVideo: false });
      // Re-render
      await this.render();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }


  public static async DeleteAnimation(this: SpriteAnimationsConfig, e: Event, elem: HTMLElement) {
    try {
      const parent = elem.closest(`[data-animation]`);
      const id = parent instanceof HTMLElement ? parent.dataset.animation : undefined;

      if (!id) {
        // Remove without confirmation
        const index = this.animations.findIndex(anim => !anim.name);
        if (index !== -1) this.animations.splice(index, 1);

        const row = this.element.querySelector(`[data-animation=""][data-role="animation-row"]`);
        if (row instanceof HTMLElement) row.remove();
      } else {
        const index = this.animations.findIndex(anim => anim.name === id);
        if (index === -1) throw new InvalidAnimationError(id);

        const confirmed = await (foundry.applications.api.DialogV2.confirm({
          window: { title: game.i18n?.localize("Confirm") },
          content: `<p>${game.i18n?.localize(`${TRANSLATION_KEY}.CONFIG.CONFIRMREMOVE`)}</p>`
        }) as Promise<boolean>);

        if (!confirmed) return;
        this.animations.splice(index, 1);

        const row = this.element.querySelector(`[data-animation="${id}"][data-role="animation-row"]`);
        if (row instanceof HTMLElement) row.remove();
      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  _onChangeForm(config: foundry.applications.api.ApplicationV2.FormConfiguration, event: Event) {
    try {
      super._onChangeForm(config, event);

      if (!(this.element instanceof HTMLFormElement)) return;
      const animations = this.parseForm();

      this.animations.splice(0, this.animations.length, ...(this.parseAnimations(JSON.parse(JSON.stringify(animations)) as AnimationConfig[])));
      this.updatePreviews();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static async onSubmit(this: SpriteAnimationsConfig, e: Event | SubmitEvent, elem: HTMLFormElement, formData: foundry.applications.ux.FormDataExtended) {
    try {
      const parsed = this.parseForm();
      await setAnimations(this.actor, parsed);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  protected updatePreviews() {
    // empty
    const rows = this.element.querySelectorAll(`[data-role="animation-row"]`);
    let index = 0;
    for (const row of rows) {
      if (row instanceof HTMLElement) {
        const animation = this.animations[index];
        if (!animation) throw new InvalidAnimationError(index);

        // Update identifier
        row.dataset.animation = animation.name;
        // Update preview image

        const preview = row.querySelector(`[data-role="preview"]`);
        if (preview instanceof HTMLElement) {
          const src = preview.dataset.src;

          if (src !== animation.src) {
            preview.dataset.src = animation.src;
            const mime = mimeType(animation.src).split("/");

            if (mime[0] === "video") {
              const vid = document.createElement("video");
              const src = document.createElement("source");

              src.src = animation.src;
              vid.appendChild(src);

              vid.width = 128;
              vid.autoplay = true;
              vid.loop = true;
              preview.innerHTML = vid.outerHTML;
            } else if (mime[0] === "image") {
              const img = document.createElement("img");
              img.src = animation.src;
              img.style.maxWidth = "128px";
              img.style.maxHeight = "128px";

              preview.innerHTML = img.outerHTML;
            }
          }
        }
      }
      index++;
    }
  }

  async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<AnimationConfigRenderContext> {
    const context: AnimationConfigRenderContext = {
      ...(await super._prepareContext(options)),
      animations: this.animations,
      buttons: [
        { type: "submit", icon: "fa-solid fa-save", label: "SETTINGS.Save" }
      ]
    }
    return context;
  }

  protected async _onRender(context: AnimationConfigRenderContext, options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<void> {
    await super._onRender(context, options);

  }

  protected parseAnimations(animations: AnimationConfig[]): AnimationContext[] {
    return animations.map(anim => ({
      ...anim,
      isVideo: mimeType(anim.src).split("/")[0] === "video"
    }));
  }

  protected parseForm(): AnimationConfig[] {
    const rows = this.element.querySelectorAll(`[data-role="animation-row"]`);
    const animations: AnimationConfig[] = [];
    for (const row of rows) {
      if (row instanceof HTMLElement) animations.push(this.parseRow(row));
    }
    return animations;
  }

  protected parseRow(row: HTMLElement): AnimationConfig {
    const animation: AnimationConfig = { name: "", src: "", loop: false };

    const nameElem = row.querySelector(`[data-role="name"]`);
    if (nameElem instanceof HTMLInputElement) animation.name = nameElem.value;

    const srcElem = row.querySelector(`[data-role="src"]`);
    if (srcElem instanceof foundry.applications.elements.HTMLFilePickerElement) animation.src = srcElem.value;

    const loopElem = row.querySelector(`[data-role="loop"]`);
    if (loopElem instanceof HTMLInputElement) animation.loop = loopElem.checked;

    return animation;
  }

  constructor(public readonly actor: Actor, options?: foundry.applications.api.HandlebarsApplicationMixin.Configuration) {
    super(options);

    const animations = this.parseAnimations(SpriteAnimator.getAnimations(actor));
    this.animations.splice(0, this.animations.length, ...animations);
  }
}