import { DeepPartial } from "fvtt-types/utils";
import { RenderContext, RenderOptions, Configuration } from "./types";
import { AnimatedPlaceable, AnimationConfig, AnimationFlags } from "interfaces";
import { downloadJSON, generatePreviewTooltip, isImage, isVideo, uploadJSON } from "utils";
import { DEFAULT_ANIMATION_FLAGS, DEFAULT_MESH_ADJUSTMENT } from "../constants";
import { LocalizedError } from "errors";


export function ConfigMixin<Document extends foundry.abstract.Document.Any, Context extends RenderContext, Config extends Configuration<Document>, Options extends RenderOptions>(Base: typeof foundry.applications.api.DocumentSheetV2<Document, Context, Config, Options>) {

  abstract class AnimatedConfig extends Base {

    static DEFAULT_OPTIONS: DeepPartial<Configuration> = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ...((Base as any).DEFAULT_OPTIONS as DeepPartial<Configuration>),
      actions: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ...(((Base as any).DEFAULT_OPTIONS as DeepPartial<Configuration>).actions),
        // eslint-disable-next-line @typescript-eslint/unbound-method
        addAnimation: AnimatedConfig.AddAnimation,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        clearAnimations: AnimatedConfig.ClearAnimations,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        removeAnimation: AnimatedConfig.RemoveAnimation,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        lockAdjustmentDimensions: AnimatedConfig.LockAdjustmentDimensions,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        autoFit: AnimatedConfig.AutoFit
      }
    }

    static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ...((Base as any).PARTS as Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart>),
      animations: {
        template: `modules/${__MODULE_ID__}/templates/config/tabs.hbs`,
        scrollable: [".sprite-animations-list"],
        templates: [
          `modules/${__MODULE_ID__}/templates/config/animations.hbs`,
          `modules/${__MODULE_ID__}/templates/config/mesh.hbs`
        ]
      }
    }

    static TABS: Record<string, foundry.applications.api.ApplicationV2.TabsConfiguration> = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ...((Base as any).TABS as Record<string, foundry.applications.api.ApplicationV2.TabsConfiguration>),
      sheet: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ...((Base as any).TABS as Record<string, foundry.applications.api.ApplicationV2.TabsConfiguration>).sheet,
        tabs: [
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          ...((Base as any).TABS as Record<string, foundry.applications.api.ApplicationV2.TabsConfiguration>).sheet.tabs,
          {
            id: "animations",
            label: "SPRITE-ANIMATIONS.TABS.ANIMATIONS",
            cssClass: "",
            icon: "fa-solid fa-person-running"
          }
        ]
      }
    };

    // #region Abstract Things
    protected abstract getPreviewMesh(): foundry.canvas.primary.PrimarySpriteMesh | undefined;
    protected abstract getMesh(): foundry.canvas.primary.PrimarySpriteMesh | undefined;
    protected abstract getAnimationFlags(): AnimationFlags;
    protected abstract setAnimationFlags(flags: AnimationFlags): Promise<void>;
    protected abstract getAnimatedPlaceable(): AnimatedPlaceable | undefined;
    // #endregion

    // #region Action Handlers

    static async RemoveAnimation(this: AnimatedConfig, event: Event, element: HTMLElement) {
      try {
        const id = element.dataset.animation;
        if (!id) return;
        const animation = this.animationFlagCache?.animations.find(animation => animation.id === id);
        if (!animation) return;
        const confirmed = (await foundry.applications.api.DialogV2.confirm({
          window: { title: game?.i18n?.localize("SPRITE-ANIMATIONS.CONFIG.REMOVE.TITLE") ?? "" },
          content: game?.i18n?.format("SPRITE-ANIMATIONS.CONFIG.REMOVE.MESSAGE", { name: animation.name })
        })) as boolean;
        if (!confirmed) return;

        const index = this.animationFlagCache?.animations.findIndex(animation => animation.id === id) ?? -1;
        if (index > -1) this.animationFlagCache?.animations.splice(index, 1);
        await this.render();
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
      }
    }

    static AutoFit(this: AnimatedConfig) {
      const start = performance.now();
      try {
        const mesh = this.getPreviewMesh();
        if (!mesh?.texture) return
        if (!canvas?.app?.renderer) return;



        const texture = mesh.texture.clone();
        const fittedDimensions = (mesh.object as unknown as AnimatedPlaceable).getFittedMeshSize();
        if (!fittedDimensions) return;


        const rt = PIXI.RenderTexture.create({ width: fittedDimensions.width, height: fittedDimensions.height });
        // const rt = PIXI.RenderTexture.create({ width: texture.width, height: texture.height })

        const sprite = new PIXI.Sprite(texture);
        sprite.width = rt.width;
        sprite.height = rt.height;
        canvas.app.renderer.render(sprite, { renderTexture: rt, clear: false });

        const pixels = Uint8ClampedArray.from(canvas.app.renderer.extract.pixels(rt));
        const imageData = new ImageData(pixels, rt.width, rt.height);

        let left = rt.width;
        let top = rt.height;
        let right = 0;
        let bottom = 0;

        for (let y = 0; y < rt.height; y++) {
          for (let x = 0; x < rt.width; x++) {
            const index = (y * rt.width + x) * 4;
            const alpha = imageData.data[index + 3];
            if (alpha > 0) {
              if (x < left) left = x;
              if (x > right) right = x;
              if (y < top) top = y;
              if (y > bottom) bottom = y;
            }
          }
        }

        const visualWidth = right - left;
        const visualHeight = bottom - top;

        const ratio = visualWidth < visualHeight ? fittedDimensions.width / visualWidth : fittedDimensions.height / visualHeight;

        // TODO: Move the anchor

        const newDimensions = {
          x: 0,
          y: 0,
          width: Math.floor(texture.width / ratio),
          height: Math.floor(texture.height / ratio)
        }

        this.setElementValue(`[name="flags.sprite-animations.meshAdjustments.width"]`, newDimensions.width.toString());
        this.setElementValue(`[name="flags.sprite-animations.meshAdjustments.height"]`, newDimensions.height.toString());
        this.setElementValue(`[name="flags.sprite-animations.meshAdjustments.x"]`, newDimensions.x.toString());
        this.setElementValue(`[name="flags.sprite-animations.meshAdjustments.y"]`, newDimensions.y.toString());

        const anchor = {
          x: (left + (visualWidth / 2)) / rt.width,
          y: (top + (visualHeight / 2)) / rt.height
        }

        this.setElementValue(`[name="flags.sprite-animations.meshAdjustments.anchor.x"]`, anchor.x.toString());
        this.setElementValue(`[name="flags.sprite-animations.meshAdjustments.anchor.y"]`, anchor.y.toString());

        this.form?.dispatchEvent(new Event("change", { bubbles: true }));
        // const previewCanvas = document.createElement("canvas");
        // const ctx = previewCanvas.getContext("2d");
        // if (!ctx) return;
        // previewCanvas.width = rt.width;
        // previewCanvas.height = rt.height;
        // ctx.putImageData(imageData, 0, 0);
        // ctx.beginPath();
        // ctx.moveTo(left, top);
        // ctx.lineTo(right, top);
        // ctx.moveTo(left, top);
        // ctx.lineTo(left, bottom);
        // ctx.moveTo(right, top);
        // ctx.lineTo(right, bottom);
        // ctx.moveTo(left, bottom);
        // ctx.lineTo(right, bottom);
        // ctx.strokeStyle = "red";
        // ctx.stroke();

        // logImage(previewCanvas.toDataURL(), rt.width, rt.height);
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
      } finally {
        console.log(`Visible dimensions determined in ${performance.now() - start}ms`);
      }
    }

    protected setElementValue(selector: string, value: string) {
      const elem = this.element.querySelector(selector);
      if (elem instanceof HTMLInputElement) elem.value = value;
    }

    protected lockAdjustmentDimensions = true;
    static LockAdjustmentDimensions(this: AnimatedConfig) {
      try {
        console.log("Lock adjustment dimensinos");
        this.lockAdjustmentDimensions = !this.lockAdjustmentDimensions;
        const button = this.element.querySelector(`[data-action="lockAdjustmentDimensions"] i`);
        console.log(button);
        if (!(button instanceof HTMLElement)) return;
        if (!this.lockAdjustmentDimensions) {
          button.classList.remove("fa-link");
          button.classList.add("fa-link-slash");
        } else {
          button.classList.add("fa-link");
          button.classList.remove("fa-link-slash");
        }
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
      }
    }

    static async AddAnimation(this: AnimatedConfig) {
      try {
        if (this.animationFlagCache?.animations.some(anim => !anim.name)) return;
        this.animationFlagCache ??= foundry.utils.deepClone(this.getAnimationFlags());

        this.animationFlagCache.animations.unshift({
          id: foundry.utils.randomID(),
          name: "",
          src: "",
          loop: false
        });
        await this.render();
        const inputElem = this.element.querySelector(`.sprite-animations-list input[type="text"]`);
        if (inputElem instanceof HTMLInputElement) inputElem.focus();
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
      }
    }

    static async ClearAnimations(this: AnimatedConfig) {
      try {
        if (!this.animationFlagCache?.animations?.length) return;
        const confirmed = (await foundry.applications.api.DialogV2.confirm({
          window: { title: game?.i18n?.localize("SPRITE-ANIMATIONS.CONFIG.CLEAR.LABEL") ?? "" },
          content: game?.i18n?.localize("SPRITE-ANIMATIONS.CONFIG.CLEAR.MESSAGE") ?? ""
        })) as boolean;

        if (!confirmed) return;

        this.animationFlagCache.animations = [];
        await this.render();
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
      }
    }

    // #endregion

    // #region Import/Export Functions

    protected async finishImport(data: AnimationFlags) {
      this.animationFlagCache = foundry.utils.deepClone(data);
      await this.render();
    }

    protected async importFromClipboard() {
      try {
        if ((await navigator.permissions.query({ name: "clipboard-read" })).state === "granted") {
          const text = await navigator.clipboard.readText();
          if (text) {
            const data = JSON.parse(text) as AnimationFlags;
            ui.notifications?.info("SPRITE-ANIMATIONS.CONFIG.IMPORT.PASTED", { localize: true });
            if (data) await this.finishImport(data);
          }
        } else {
          const content = await foundry.applications.handlebars.renderTemplate(`modules/${__MODULE_ID__}/templates/PasteJSON.hbs`, {});
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const { json } = await foundry.applications.api.DialogV2.input({
            window: { title: "SPRITE-ANIMATIONS.CONFIG.IMPORT.LABEL" },
            position: { width: 600 },
            content
          }) as any;

          if (typeof json === "string") {
            try {
              const data = JSON.parse(json) as AnimationFlags;
              if (data) await this.finishImport(data)
            } catch (err) {
              console.error(err);
              throw new LocalizedError("INVALIDJSON");
            }
          }
        }

      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
      }
    }

    async uploadFile() {
      try {
        const data = await uploadJSON<AnimationFlags>();
        if (!data) return;

        await this.finishImport(data);

      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
      }
    }
    async bulkImport() {
      try {
        if (this.animationFlagCache?.animations?.length) {
          const confirmed = (await foundry.applications.api.DialogV2.confirm({
            window: { title: game?.i18n?.localize("SPRITE-ANIMATIONS.CONFIG.IMPORT.BULK") ?? "" },
            content: game?.i18n?.localize("SPRITE-ANIMATIONS.CONFIG.IMPORT.BULKWARNING") ?? ""
          })) as boolean;
          if (!confirmed) return;
        }
        const path = (await new Promise(resolve => { void new foundry.applications.apps.FilePicker.implementation({ type: "folder", callback: resolve }).browse("/"); }));
        if (typeof path !== "string") return;

        const picker = await foundry.applications.apps.FilePicker.implementation.browse("data", path);
        const files = picker.files.filter(file => (isVideo(file) || isImage(file)) && !file.endsWith(".gif"));

        this.animationFlagCache ??= foundry.utils.deepClone(DEFAULT_ANIMATION_FLAGS);

        this.animationFlagCache.animations = files.map(file => {
          const split = file.split("/");
          return {
            id: foundry.utils.randomID(),
            name: decodeURI(split[split.length - 1].split(".")[0]),
            src: file,
            loop: false
          }
        });
        await this.render();

      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
      }
    }

    protected async exportToClipboard() {
      try {
        if ((await navigator.permissions.query({ name: "clipboard-write" })).state === "granted") {
          await navigator.clipboard.writeText(JSON.stringify(this.animationFlagCache));
          ui.notifications?.info("SPRITE-ANIMATIONS.CONFIG.EXPORT.COPIED", { localize: true });
        } else {
          const content = await foundry.applications.handlebars.renderTemplate(`modules/${__MODULE_ID__}/templates/CopyJSON.hbs`, {
            config: JSON.stringify(this.animationFlagCache, null, 2)
          });
          await foundry.applications.api.DialogV2.input({
            window: { title: "SPRITE-ANIMATIONS.CONFIG.EXPORT.LABEL" },
            position: { width: 600 },
            content
          });
        }
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
      }
    }


    // #endregion


    // #region Drag adjustments

    protected dragAdjustments = {
      x: "",
      y: "",
      width: "",
      height: ""
    }

    protected applyDragAdjustment(selector: string, amount: number) {
      const elem = this.element.querySelector(selector);
      if (elem instanceof HTMLInputElement) {
        elem.value = Math.floor(parseFloat(elem.value) + amount).toString();
        elem.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    protected _dragAdjustMouseUp = (() => {
      this.dragAdjustments.x = this.dragAdjustments.y = this.dragAdjustments.width = this.dragAdjustments.height = "";
    }).bind(this); // pre-bind it so we can attach/detach the listener more readily

    protected _dragAdjustMouseMove = ((e: MouseEvent) => {
      if (this.dragAdjustments.x) this.applyDragAdjustment(this.dragAdjustments.x, e.movementX);
      if (this.dragAdjustments.y) this.applyDragAdjustment(this.dragAdjustments.y, e.movementY);

      if (this.dragAdjustments.width || this.dragAdjustments.height) {
        if (this.lockAdjustmentDimensions) {
          if (this.dragAdjustments.width && this.dragAdjustments.height) {
            if (Math.abs(e.movementX) > Math.abs(e.movementY)) {
              this.applyDragAdjustment(this.dragAdjustments.width, e.movementX);
              this.applyDragAdjustment(this.dragAdjustments.height, e.movementX);
            } else {
              this.applyDragAdjustment(this.dragAdjustments.width, e.movementY);
              this.applyDragAdjustment(this.dragAdjustments.height, e.movementY);
            }
          } else {
            if (this.dragAdjustments.width) this.applyDragAdjustment(this.dragAdjustments.width, e.movementX);
            if (this.dragAdjustments.height) this.applyDragAdjustment(this.dragAdjustments.height, e.movementY);
          }
        } else {
          if (this.dragAdjustments.width) this.applyDragAdjustment(this.dragAdjustments.width, e.movementX);
          if (this.dragAdjustments.height) this.applyDragAdjustment(this.dragAdjustments.height, e.movementY);
        }
      }

      // TODO: Preserve aspect ratio
    }).bind(this); // pre-bind it so we can attach/detach the listener more readily

    // #endregion

    // #region Form Handling

    protected parseAnimationList(): AnimationConfig[] | undefined {
      const container = this.element.querySelector(`[data-role="animation-list"]`);
      if (!(container instanceof HTMLElement)) return;

      const currentAnimations: AnimationConfig[] = [];

      const nameElements: HTMLInputElement[] = Array.from(container.querySelectorAll(`[data-role="animation-name"]`));
      const pathElements: foundry.applications.elements.HTMLFilePickerElement[] = Array.from(container.querySelectorAll(`file-picker`));
      const loopElements: HTMLInputElement[] = Array.from(container.querySelectorAll(`[data-role="animation-loop"]`));

      for (let i = 0; i < nameElements.length; i++) {
        const nameElement = nameElements[i];
        const pathElement = pathElements[i];
        const loopElement = loopElements[i];

        const id = nameElement.dataset.animation ?? foundry.utils.randomID();

        const animation: AnimationConfig = {
          id,
          name: nameElement.value ?? "",
          src: pathElement.value ?? "",
          loop: loopElement.checked ?? false
        };
        currentAnimations.push(animation);
      }

      return currentAnimations;
    }

    _onChangeForm(formConfig: foundry.applications.api.ApplicationV2.FormConfiguration, event: Event) {
      super._onChangeForm(formConfig, event);

      const animations = this.parseAnimationList();
      if (!animations) return;

      this.animationFlagCache ??= foundry.utils.deepClone(DEFAULT_ANIMATION_FLAGS);
      this.animationFlagCache.animations = animations;

      // TODO: Update mesh adjustment cache

      if (this.form) {
        const form = foundry.utils.expandObject((new foundry.applications.ux.FormDataExtended(this.form)).object) as Record<string, unknown>;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const flags = ((form.flags as any)?.["sprite-animations"] as DeepPartial<AnimationFlags> ?? {});
        const mesh = this.getPreviewMesh();

        if (flags.meshAdjustments && mesh?.object) {
          const adjustments = foundry.utils.deepClone(DEFAULT_MESH_ADJUSTMENT);
          foundry.utils.mergeObject(adjustments, flags.meshAdjustments);
          // (mesh.object as unknown as AnimatedPlaceable).applyAnimationMeshAdjustments(adjustments, true);
          (mesh.object as unknown as AnimatedPlaceable).previewAnimationAdjustments = {
            ...adjustments,
            enable: true,
          }
        }

      }
    }

    _previewChanges(changes: Record<string, unknown>) {
      const mesh = this.getPreviewMesh();
      if (mesh) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (mesh.object as unknown as AnimatedPlaceable).previewAnimationAdjustments = ((changes?.flags as any)?.[__MODULE_ID__] as AnimationFlags | undefined)?.meshAdjustments ?? this.getAnimationFlags()?.meshAdjustments ?? DEFAULT_MESH_ADJUSTMENT;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      super._previewChanges(changes);
    }

    protected async _processSubmitData(event: SubmitEvent, form: HTMLFormElement, formData: foundry.applications.ux.FormDataExtended, options?: unknown): Promise<void> {

      const flags = foundry.utils.getProperty(formData instanceof foundry.applications.ux.FormDataExtended ? foundry.utils.expandObject(formData.object) : formData, `flags.${__MODULE_ID__}`) as AnimationFlags | undefined;

      if (flags) {
        foundry.utils.deleteProperty(formData as any, `flags.${__MODULE_ID__}`);
        await this.setAnimationFlags(flags);
      }

      await super._processSubmitData(event, form, formData, options);
    }

    _processFormData(event: SubmitEvent | null, html: HTMLFormElement, data: foundry.applications.ux.FormDataExtended) {
      const parsed = super._processFormData(event, html, data)
      const animations = this.parseAnimationList();
      if (animations) {
        foundry.utils.setProperty(parsed, `flags.${__MODULE_ID__}.animations`, animations)
      }

      return parsed;
    }

    // #endregion

    _onClose(options: DeepPartial<Options>) {
      this.animationFlagCache = undefined;
      window.removeEventListener("mousemove", this._dragAdjustMouseMove);
      window.removeEventListener("mouseup", this._dragAdjustMouseUp);
      super._onClose(options);
    }

    protected animationFlagCache: AnimationFlags | undefined = undefined;

    protected setPreviewTooltips() {
      const previewElements: HTMLElement[] = Array.from(this.element.querySelectorAll(`[data-role="preview-tooltip"]`));

      for (const elem of previewElements) {
        elem.addEventListener("mouseenter", () => {
          const name = elem.dataset.animationName;
          if (!name) return;
          const animation = this.animationFlagCache?.animations.find(anim => anim.name === name);
          if (!animation) return;
          const tooltip = generatePreviewTooltip(animation);
          game.tooltip?.activate(elem, { html: tooltip.outerHTML, direction: foundry.helpers.interaction.TooltipManager.implementation.TOOLTIP_DIRECTIONS.UP });
        });
        elem.addEventListener("mouseleave", () => { game.tooltip?.deactivate(); });
      }

    }

    protected async _onFirstRender(context: DeepPartial<Context>, options: DeepPartial<Options>) {
      await super._onFirstRender(context, options);

      window.addEventListener("mousemove", this._dragAdjustMouseMove);
      window.addEventListener("mouseup", this._dragAdjustMouseUp);
    }

    protected async _onRender(context: DeepPartial<Context>, options: DeepPartial<Options>) {
      await super._onRender(context, options);

      this.setPreviewTooltips();

      const dragPos = this.element.querySelector(`[data-role="drag-pos"]`);
      if (dragPos instanceof HTMLElement) {
        dragPos.addEventListener("mousedown", () => {
          this.dragAdjustments.x = `[name="flags.sprite-animations.meshAdjustments.x"]`;
          this.dragAdjustments.y = `[name="flags.sprite-animations.meshAdjustments.y"]`;
          this.dragAdjustments.width = this.dragAdjustments.height = "";
        })
      }

      const dragSize = this.element.querySelector(`[data-role="drag-size"]`);
      if (dragSize instanceof HTMLElement) {
        dragSize.addEventListener("mousedown", () => {
          this.dragAdjustments.width = `[name="flags.sprite-animations.meshAdjustments.width"]`;
          this.dragAdjustments.height = `[name="flags.sprite-animations.meshAdjustments.height"]`;
          this.dragAdjustments.x = this.dragAdjustments.y = "";
        })
      }

      // Set up context menus for import/export
      new foundry.applications.ux.ContextMenu(
        this.element,
        `[data-role="import-animations"]`,
        [
          {
            name: "SPRITE-ANIMATIONS.CONFIG.IMPORT.BULK",
            icon: `<i class="fa-solid fa-folder-tree"></i>`,
            callback: () => { void this.bulkImport(); }
          },
          {
            name: "SPRITE-ANIMATIONS.CONFIG.IMPORT.CLIPBOARD",
            icon: `<i class="fa-solid fa-paste"></i>`,
            callback: () => { void this.importFromClipboard(); }
          },
          {
            name: "SPRITE-ANIMATIONS.CONFIG.IMPORT.UPLOAD",
            icon: `<i class="fa-solid fa-upload"></i>`,
            callback: () => { void this.uploadFile(); }
          }
        ],
        {
          jQuery: false,
          eventName: "click",
          fixed: true
        }
      );

      new foundry.applications.ux.ContextMenu(
        this.element,
        `[data-role="export-animations"]`,
        [
          {
            name: "SPRITE-ANIMATIONS.CONFIG.EXPORT.CLIPBOARD",
            icon: `<i class="fa-solid fa-copy"></i>`,
            callback: () => { void this.exportToClipboard(); }
          },
          {
            name: "SPRITE-ANIMATIONS.CONFIG.EXPORT.DOWNLOAD",
            icon: `<i class="fa-solid fa-download"></i>`,
            callback: () => {
              if (this.animationFlagCache)
                downloadJSON(this.animationFlagCache, `${this.document.name ?? "animations"}.json`);
            }
          }
        ],
        {
          jQuery: false,
          eventName: "click",
          fixed: true
        }
      )

    }

    protected async _prepareContext(options: DeepPartial<Options> & { isFirstRender: boolean; }): Promise<Context> {
      const context = await super._prepareContext(options);

      if (!this.animationFlagCache) {
        const flags = this.getAnimationFlags();
        this.animationFlagCache = foundry.utils.deepClone(flags);
      }

      for (const anim of this.animationFlagCache.animations)
        if (!anim.id) anim.id = foundry.utils.randomID();

      context.animations = {
        idPrefix: foundry.utils.randomID(),
        ...(foundry.utils.deepClone(this.animationFlagCache)),
        adjustPosTooltip: "",
        adjustSizeTooltip: "",
        tabs: [
          { id: "animations", group: "animations", active: true, cssClass: "", icon: "fa-solid fa-cog", label: "SPRITE-ANIMATIONS.TABS.ANIMATIONS" },
          { id: "mesh", group: "animations", active: false, cssClass: "", icon: "fa-solid fa-cube", label: "SPRITE-ANIMATIONS.TABS.MESH" }
        ]
      };

      return context;
    }

    // protected abstract getAnimationFlags(): DeepPartial<AnimationFlags>;
  }

  const footer = AnimatedConfig.PARTS.footer;
  delete AnimatedConfig.PARTS.footer;
  AnimatedConfig.PARTS.footer = footer;

  return AnimatedConfig;
}
