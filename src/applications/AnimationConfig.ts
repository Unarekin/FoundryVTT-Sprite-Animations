import { DeepPartial } from "types";
import { AnimationConfig } from "interfaces";
import { AnimationConfigRenderContext, AnimationConfigConfiguration, AnimationConfigRenderOptions } from "./types";
import { InvalidAnimationError } from "errors";
import { DEFAULT_ANIMATION } from "../constants";

export class AnimationConfiguration extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2<AnimationConfigRenderContext, AnimationConfigConfiguration, AnimationConfigRenderOptions>) {
  #animation: AnimationConfig;
  #editPromise: Promise<AnimationConfig | undefined> | undefined = undefined;
  #editResolve: ((config?: AnimationConfig) => void) | undefined = undefined;
  // eslint-disable-next-line no-unused-private-class-members
  #editReject: ((error: Error) => void) | undefined = undefined;

  #submitted = false;

  public static DEFAULT_OPTIONS: DeepPartial<AnimationConfigConfiguration> = {
    window: {
      title: "SPRITE-ANIMATIONS.ANIMATIONCONFIG.TITLE",
      icon: "fa-solid fa-person-running",
      contentClasses: ["standard-form"]
    },
    tag: "form",

    form: {
      submitOnChange: false,
    },
    actions: {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      close: AnimationConfiguration.Close,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      submit: AnimationConfiguration.Submit
    }
  }

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: `modules/${__MODULE_ID__}/templates/config/animationConfig.hbs`
    },
    footer: {
      template: `templates/generic/form-footer.hbs`
    }
  }

  static async Close(this: AnimationConfiguration) {
    this.#submitted = false;
    await this.close();
  }

  static async Submit(this: AnimationConfiguration) {
    this.#submitted = true;
    await this.close();
  }

  public static edit(animation: AnimationConfig): Promise<AnimationConfig | undefined> {
    return new AnimationConfiguration({ animation }).edit();
  }

  public async edit(): Promise<AnimationConfig | undefined> {
    if (this.#editPromise) return this.#editPromise;
    this.#editPromise = new Promise((resolve, reject) => {
      this.#editReject = reject;
      this.#editResolve = resolve;
    });
    await this.render({ force: true })
    return this.#editPromise;
  }

  protected _onClose(options: AnimationConfigRenderOptions): void {
    if (this.#editResolve) {
      if (this.#submitted) {
        // TODO: Change to foundry.applications.ux.FormDataExtended when dropping supprot for v12
        // const data = foundry.utils.expandObject((new FormDataExtended(this.form!)).object) as AnimationConfig;
        this.#editResolve(this.#animation);
      } else {
        this.#editResolve();
      }
    }

    this.#editPromise = undefined;
    this.#editReject = undefined;
    this.#editResolve = undefined;

    super._onClose(options);
  }

  _onChangeForm(formConfig: foundry.applications.api.ApplicationV2.FormConfiguration, e: Event) {
    super._onChangeForm(formConfig, e);

    // TODO: Change to foundry.applications.ux.FormDataExtended when dropping supprot for v12
    const data = foundry.utils.expandObject((new FormDataExtended(this.form!)).object) as AnimationConfig;
    foundry.utils.mergeObject(this.#animation, data);
    this.#animation.volume /= 100;

    const preview = this.element.querySelector(`[data-role="audio-preview"]`);
    if (preview instanceof HTMLAudioElement) {
      const url = new URL(data.sound, window.location.href);
      if (preview.src !== url.href) preview.src = data.sound;
      const volume = typeof data.volume === "number" ? data.volume / 100 : 1;
      if (preview.volume !== volume) preview.volume = volume;
    }
  }

  async _onRender(context: AnimationConfigRenderContext, options: AnimationConfigRenderOptions) {
    await super._onRender(context, options);
    const preview = this.element.querySelector(`[data-role="audio-preview"]`);
    if (preview instanceof HTMLAudioElement) {
      preview.addEventListener("volumechange", () => {
        const volumeElem = this.element.querySelector(`[name="volume"]`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (volumeElem instanceof HTMLElement && (volumeElem as any).value !== preview.volume * 100) (volumeElem as any).value = preview.volume * 100;
      })
    }
  }

  async _prepareContext(options: AnimationConfigRenderOptions) {
    const context = await super._prepareContext(options);

    context.animation = foundry.utils.deepClone(this.#animation);
    context.idPrefix = foundry.utils.randomID();

    context.animation.volume *= 100;

    context.buttons = [
      { type: "button", action: "close", label: "Close", icon: `<i class="fa-solid fa-times"></i>` },
      { type: "submit", action: "submit", label: "Save", icon: `<i class="fa-solid fa-check"></i>` }
    ]


    return context;
  }

  constructor(options: Partial<AnimationConfigConfiguration>) {
    if (!options.animation)
      throw new InvalidAnimationError(options.animation);
    super(options);
    this.#animation = foundry.utils.deepClone(DEFAULT_ANIMATION);
    foundry.utils.mergeObject(this.#animation, options.animation);
  }
}
