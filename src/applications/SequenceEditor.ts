/* eslint-disable @typescript-eslint/unbound-method */
import { AnimationConfig, AnimationSequence } from "interfaces";
import { DeepPartial } from "types";
import { SequenceEditorContext } from "./types";
import { SequenceItemEditor } from "./SequenceItemEditor";
import { getFormData } from "utils";

export class SequenceEditor extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2<SequenceEditorContext>) {

  static DEFAULT_OPTIONS: DeepPartial<foundry.applications.api.ApplicationV2.Configuration> = {
    window: {
      title: "SPRITE-ANIMATIONS.SEQUENCEEDITOR.TITLE",
      contentClasses: ["standard-form"],
    },
    position: {
      width: 450
    },
    tag: "form",
    actions: {
      addAnimation: SequenceEditor.AddAnimation,
      editAnimation: SequenceEditor.EditAnimation,
      removeAnimation: SequenceEditor.RemoveAnimation,
      close: SequenceEditor.Close,
      submit: SequenceEditor.Submit
    }
  }

  static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: `modules/${__MODULE_ID__}/templates/config/sequenceEditor.hbs`,
      classes: ["scrollable"],
      scrollable: ["scrollable"]
    },
    footer: {
      template: `templates/generic/form-footer.hbs`
    }
  }

  protected sequence: AnimationSequence | undefined = undefined;
  protected animations: AnimationConfig[] = [];
  protected promise: Promise<AnimationSequence | undefined> | undefined = undefined;
  protected resolve: ((sequence?: AnimationSequence) => void) | undefined = undefined;

  public static async Edit(sequence?: AnimationSequence, availableAnimations: AnimationConfig[] = []): Promise<AnimationSequence | undefined> {
    const app = new SequenceEditor();
    return app.Edit(sequence, availableAnimations);
  }

  async Edit(sequence?: AnimationSequence, availableAnimations: AnimationConfig[] = []): Promise<AnimationSequence | undefined> {
    if (sequence)
      this.sequence = sequence;
    this.animations = availableAnimations.map(anim => foundry.utils.deepClone(anim));

    const { promise, resolve } = Promise.withResolvers<AnimationSequence | undefined>();
    this.promise = promise;
    this.resolve = resolve;
    await this.render({ force: true });
    return promise;
  }

  static async AddAnimation(this: SequenceEditor) {
    try {
      const item = await SequenceItemEditor.Create(this.animations);
      if (!item) return;
      this.sequence!.sequence.push(item);
      await this.render();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }

  static async RemoveAnimation(this: SequenceEditor, e: Event, elem: HTMLElement) {
    try {
      if (!this.sequence) return;
      const id = elem.dataset.animation;
      if (!id) return void console.warn("No animation id");
      const animationProp = this.sequence.sequence.find(anim => anim.id === id);
      if (!animationProp) return void console.warn("Animation not found");
      const animation = typeof animationProp.animation === "string" ? this.animations.find(anim => anim.id === animationProp.animation) : animationProp.animation;
      if (!animation) return void console.warn("Animation not found");

      const confirmed = (await foundry.applications.api.DialogV2.confirm({
        window: { title: game?.i18n?.localize("SPRITE-ANIMATIONS.CONFIG.REMOVE.TITLE") ?? "" },
        content: game?.i18n?.format("SPRITE-ANIMATIONS.CONFIG.REMOVE.MESSAGE", { name: animation.name })
      }))!;
      if (!confirmed) return;
      const index = this.sequence.sequence.findIndex(anim => anim.id === id);
      if (index !== -1) this.sequence.sequence.splice(index, 1);
      await this.render();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }

  static async EditAnimation(this: SequenceEditor, e: Event, elem: HTMLElement) {
    try {
      if (!this.sequence) return;
      const id = elem.dataset.animation;
      if (!id) return void console.warn("No animation id");
      const animation = this.sequence.sequence.find(item => item.id === id);
      if (!animation) return void console.warn("Animation not found");
      const edited = await SequenceItemEditor.Edit(foundry.utils.deepClone(animation), this.animations);
      if (!edited) return;
      const index = this.sequence.sequence.findIndex(item => item.id === id);
      if (index === -1) return void console.warn("Could not find animation in array");
      this.sequence.sequence.splice(index, 1, edited);
      await this.render();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }

  static async Close(this: SequenceEditor) {
    await this.close();
  }

  static async Submit(this: SequenceEditor) {
    if (this.resolve)
      this.resolve(this.sequence);
    this.resolve = this.promise = undefined;
    await this.close();
  }

  _onChangeForm(config: foundry.applications.api.ApplicationV2.FormConfiguration, event: Event) {
    super._onChangeForm(config, event);
    const data = getFormData<AnimationSequence>(this.element as HTMLFormElement);
    const sequence = this.sequence?.sequence ?? [];
    this.sequence = foundry.utils.deepClone(data);
    this.sequence.sequence = sequence;
  }

  _onClose(options: foundry.applications.api.ApplicationV2.RenderOptions) {
    super._onClose(options);
    if (this.resolve) this.resolve();
    this.resolve = this.promise = undefined;
  }

  async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions) {
    const context = await super._prepareContext(options);
    context.idPrefix = foundry.utils.randomID();

    context.animations = Object.fromEntries(
      this.animations.map(anim => [anim.id, anim.name])
    );

    context.sequence = foundry.utils.deepClone(this.sequence!);

    context.buttons = [
      { type: "button", action: "close", label: "Close", icon: `<i class="fa-solid fa-times"></i>` },
      { type: "submit", action: "submit", label: "Save", icon: `<i class="fa-solid fa-check"></i>` }
    ]

    return context;
  }
}