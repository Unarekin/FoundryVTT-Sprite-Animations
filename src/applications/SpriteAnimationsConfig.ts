import { AnimationConfigRenderContext, AnimationConfigRenderOptions, AnimationContext } from "./types";
import { InvalidAnimationError } from "errors";
import { DEFAULT_MESH_ADJUSTMENT, TRANSLATION_KEY } from "../constants";
import { AnimationConfig, Animatable, MeshAdjustmentConfig } from "interfaces";
import { SpriteAnimator } from "SpriteAnimator";
import { mimeType } from "utils";
import { applyMeshAdjustments, getMeshAdjustments, setAnimations, setMeshAdjustments } from "settings";
import { DeepPartial } from "types";

type ApplicationType = typeof foundry.applications.api.ApplicationV2<foundry.applications.api.ApplicationV2.RenderContext, foundry.applications.api.ApplicationV2.Configuration>;
const MixedClass: foundry.applications.api.HandlebarsApplicationMixin.Mix<ApplicationType> = foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2);

export class SpriteAnimationsConfig extends MixedClass {
  static DEFAULT_OPTIONS = {
    window: {
      title: "SPRITE-ANIMATIONS.CONFIG.HEADER",
      icon: "fa-solid fa-person-running",
      contentClasses: ["standard-form", "flexcol", "animation-config"],
      resizable: true
    },
    position: {
      // width: 1000
      width: 512
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
      addAnimation: SpriteAnimationsConfig.AddAnimation,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      toggleLinkSizeDimensions: SpriteAnimationsConfig.ToggleLinkSizeDimensions
    }
  }

  static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    header: {
      template: `modules/${__MODULE_ID__}/templates/animationConfig/header.hbs`
    },
    tabs: {
      template: `templates/generic/tab-navigation.hbs`
    },
    animations: {
      template: `modules/${__MODULE_ID__}/templates/animationConfig/animations-tab.hbs`,
      scrollable: [".animation-list"],
      templates: [
        `modules/${__MODULE_ID__}/templates/animationConfig/controls.hbs`,
        `modules/${__MODULE_ID__}/templates/animationConfig/config.hbs`,
        `modules/${__MODULE_ID__}/templates/animationConfig/animationRow.hbs`,
        `modules/${__MODULE_ID__}/templates/animationPreview.hbs`
      ]
    },
    mesh: {
      template: `modules/${__MODULE_ID__}/templates/animationConfig/mesh-tab.hbs`
    },
    // controls: {
    //   template: `modules/${__MODULE_ID__}/templates/animationConfig/controls.hbs`
    // },
    // config: {
    //   template: `modules/${__MODULE_ID__}/templates/animationConfig/config.hbs`,
    //   templates: [
    //     `modules/${__MODULE_ID__}/templates/animationConfig/animationRow.hbs`,
    //     `modules/${__MODULE_ID__}/templates/animationPreview.hbs`
    //   ]
    // },
    footer: {
      template: `templates/generic/form-footer.hbs`
    }
  }

  protected preserveSizeAspectRatio = true;
  protected dragAdjustments = {
    x: "",
    y: "",
    width: "",
    height: ""
  };

  static ToggleLinkSizeDimensions(this: SpriteAnimationsConfig) {
    try {
      this.preserveSizeAspectRatio = !this.preserveSizeAspectRatio;
      const icon = this.element.querySelector(`[data-action="toggleLinkSizeDimensions"] i`);
      if (icon instanceof HTMLElement) {
        if (this.preserveSizeAspectRatio) {
          icon.classList.remove("fa-link-slash");
          icon.classList.add("fa-link");
        } else {
          icon.classList.add("fa-link-slash");
          icon.classList.remove("fa-link");
        }

      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }

  protected readonly animations: AnimationContext[] = [];
  protected readonly adjustments: MeshAdjustmentConfig;

  protected applyDragAdjustment(selector: string, delta: number) {
    const elem = this.element.querySelector(selector);
    if (elem instanceof HTMLInputElement) {
      elem.value = Math.floor((parseFloat(elem.value) + delta)).toString();
      elem.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  protected forceAdjustmentSizeToAspectRatio() {
    const widthElem = this.element.querySelector(`[name="meshAdjustments.width"]`);
    const heightElem = this.element.querySelector(`[name="meshAdjustments.height"]`);
    if (!(widthElem instanceof HTMLInputElement && heightElem instanceof HTMLInputElement)) return;

    const widthAdjust = parseFloat(widthElem.value);
    const heightAdjust = parseFloat(heightElem.value);

    let texture: PIXI.Texture | undefined = undefined;

    if (this.object instanceof Actor) {
      if (this.object.isToken && this.object.token?.texture?.src) texture = PIXI.Texture.from(this.object.token.texture.src);
      if (!this.object.isToken && this.object.prototypeToken.texture?.src) texture = PIXI.Texture.from(this.object.prototypeToken.texture.src);
    } else if ((this.object instanceof Tile || this.object instanceof Token) && this.object.document.texture.src) {
      texture = PIXI.Texture.from(this.object.document.texture.src);
    } else if ((this.object instanceof TileDocument || this.object instanceof TokenDocument) && this.object.texture?.src) {
      texture = PIXI.Texture.from(this.object.texture.src)
    }

    if (texture) {
      if (texture.width > texture.height) {
        const aspectRatio = texture.width/texture.height;
        heightElem.value = Math.floor(widthAdjust * aspectRatio).toString();
      } else {
        const aspectRatio = texture.height/texture.width;
        widthElem.value = Math.floor(heightAdjust * aspectRatio).toString();
      }

    }
  }

  protected _dragAdjustMouseMove = ((e: MouseEvent) => {
    if (this.dragAdjustments.x)
      this.applyDragAdjustment(this.dragAdjustments.x, e.movementX);
    if (this.dragAdjustments.y)
      this.applyDragAdjustment(this.dragAdjustments.y, e.movementY);

    if (this.dragAdjustments.width)
      this.applyDragAdjustment(this.dragAdjustments.width, e.movementX);
    if (this.dragAdjustments.height)
      this.applyDragAdjustment(this.dragAdjustments.height, -e.movementY);

    if (this.preserveSizeAspectRatio)
      this.forceAdjustmentSizeToAspectRatio();

  }).bind(this);

  protected _dragAdjustMouseUp = (() => {
    this.dragAdjustments.x = this.dragAdjustments.y = this.dragAdjustments.width = this.dragAdjustments.height = "";
  }).bind(this);

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

      console.log(this.object)

      const formData = foundry.utils.expandObject((new foundry.applications.ux.FormDataExtended(this.element).object)) as AnimationConfigRenderContext;
      const { meshAdjustments } = formData;

      if (this.object instanceof Actor) {
        this.object.getActiveTokens().forEach(token => { applyMeshAdjustments(token, meshAdjustments); });
      } else {
        applyMeshAdjustments(this.object, meshAdjustments);
      }

      this.previousAdjustments = foundry.utils.deepClone(meshAdjustments);

    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  public static async onSubmit(this: SpriteAnimationsConfig, e: Event | SubmitEvent, elem: HTMLFormElement, formData: foundry.applications.ux.FormDataExtended) {
    try {
      const data = foundry.utils.expandObject(formData.object);
      const parsed = this.parseForm();
      await setAnimations(this.object, parsed);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      await setMeshAdjustments(this.object, (data as any).meshAdjustments);

      // If it's a tile, call its refresh function since it won't ahppen automatically.
      if (this.object instanceof Tile) this.object.refresh();
      else if (this.object instanceof TileDocument) this.object.object?.refresh();

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

  async _preparePartContext(partId: string, context: AnimationConfigRenderContext, options: AnimationConfigRenderOptions): Promise<AnimationConfigRenderContext> {
    const newContext = await super._preparePartContext(partId, context, options) as AnimationConfigRenderContext;

    if (partId in (context.tabs ?? []))
      newContext.tab = newContext.tabs?.[partId];

    return newContext;
  }

  async _onFirstRender(context: DeepPartial<AnimationConfigRenderContext>, options: AnimationConfigRenderOptions) {
    await super._onFirstRender(context, options);
    window.addEventListener("mousemove", this._dragAdjustMouseMove);
    window.addEventListener("mouseup", this._dragAdjustMouseUp);
  }

  _onClose(options: DeepPartial<AnimationConfigRenderOptions>) {
    window.removeEventListener("mousemove", this._dragAdjustMouseMove);
    window.removeEventListener("mouseup", this._dragAdjustMouseUp);

    super._onClose(options);
  }

  protected removeFilterByClass(displayObject: PIXI.DisplayObject, filterType: typeof PIXI.Filter) {
    if (!displayObject.filters?.length) return;
    const filters = [...displayObject.filters.filter(filter => filter instanceof filterType)];
    displayObject.filters = displayObject.filters.filter(filter => !(filter instanceof filterType));
    filters.forEach(filter => filter.destroy());
  }

  async _onRender(context: DeepPartial<AnimationConfigRenderContext>, options: DeepPartial<AnimationConfigRenderOptions>) {
    await super._onRender(context, options);
    const dragPos = this.element.querySelector(`[data-role="drag-pos"]`);
    if (dragPos instanceof HTMLButtonElement) {
      dragPos.addEventListener("mousedown", () => {
        this.dragAdjustments.x = `[name="meshAdjustments.x"]`;
        this.dragAdjustments.y = `[name="meshAdjustments.y"]`;
        this.dragAdjustments.width = this.dragAdjustments.height = "";
      });
    }

    const dragSize = this.element.querySelector(`[data-role="drag-size"]`);
    if (dragSize instanceof HTMLButtonElement) {
      dragSize.addEventListener("mousedown", () => {
        this.dragAdjustments.x = this.dragAdjustments.y = "";
        this.dragAdjustments.width = `[name="meshAdjustments.width"]`;
        this.dragAdjustments.height = `[name="meshAdjustments.height"]`
      })
    }
  }

  protected previousAdjustments = {
    enable: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0
  }

  protected getSpriteMeshes(): foundry.canvas.primary.PrimarySpriteMesh[] {
    if (this.object instanceof Actor) {
      return this.object.getActiveTokens().map(token => token.mesh).filter(mesh => !!mesh);
    } else if ((this.object instanceof Tile || this.object instanceof Token) && this.object.mesh) {
      return [this.object.mesh];
    } else if ((this.object instanceof TileDocument || this.object instanceof TokenDocument) && this.object.object?.mesh) {
      return [this.object.object.mesh];
    } else {
      return [];
    }
  }

  async _prepareContext(options: AnimationConfigRenderOptions): Promise<AnimationConfigRenderContext> {

    const context: AnimationConfigRenderContext = {
      ...(await super._prepareContext(options)),
      animations: this.animations,
      adjustPosTooltip: "",
      adjustSizeTooltip: "",
      buttons: [
        { type: "submit", icon: "fa-solid fa-save", label: "SETTINGS.Save" }
      ],
      meshAdjustments: this.adjustments
    }

    this.previousAdjustments = foundry.utils.deepClone(this.adjustments);


    context.tabs = {
      animations: {
        id: "animations",
        icon: "fa-solid fa-person-running",
        label: "SPRITE-ANIMATIONS.CONFIG.TABS.ANIMATIONS",
        group: "primary",
        active: true,
        cssClass: "active animation-config"
      },
      mesh: {
        id: "mesh",
        icon: "fa-solid fa-cube",
        label: "SPRITE-ANIMATIONS.CONFIG.TABS.MESH",
        group: "primary",
        active: false,
        cssClass: ""
      }
    }

    return context;
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

  constructor(public readonly object: Animatable, options?: foundry.applications.api.HandlebarsApplicationMixin.Configuration) {
    super(options);

    const animations = this.parseAnimations(SpriteAnimator.getAnimations(object) ?? []);
    this.animations.splice(0, this.animations.length, ...animations);
    this.adjustments = getMeshAdjustments(object) ?? DEFAULT_MESH_ADJUSTMENT;
  }
}