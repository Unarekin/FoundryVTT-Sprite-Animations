/* eslint-disable @typescript-eslint/unbound-method */
import { AnimationConfig, SequenceItem } from "interfaces";
import { SequenceItemEditorContext } from "./types";
import { DEFAULT_ANIMATION_SEQUENCE_ITEM } from "../constants";
import { DeepPartial } from "types";
import { getFormData } from "utils";

type Configuration = foundry.applications.api.ApplicationV2.Configuration;
type RenderOptions = foundry.applications.api.ApplicationV2.RenderOptions

export class SequenceItemEditor extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2<SequenceItemEditorContext>) {

  static DEFAULT_OPTIONS: DeepPartial<Configuration> = {
    window: {
      title: "SPRITE-ANIMATIONS.ITEMEDITOR.TITLE",
      contentClasses: ["standard-form"]
    },
    tag: "form",
    form: {
      submitOnChange: false,
      closeOnSubmit: true,
    },
    actions: {
      submit: SequenceItemEditor.Submit,
      cancel: SequenceItemEditor.Cancel
    }
  }

  static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: `modules/${__MODULE_ID__}/templates/config/sequenceItemEditor.hbs`
    },
    footer: {
      template: `templates/generic/form-footer.hbs`
    }
  }



  protected promise: (Promise<SequenceItem | undefined>) | undefined = undefined;
  protected resolve: ((item?: SequenceItem) => void) | undefined = undefined;
  protected reject: ((error: Error) => void) | undefined = undefined;

  static async Edit(item: SequenceItem, animations?: AnimationConfig[]): Promise<SequenceItem | undefined> {
    const app = new SequenceItemEditor(undefined, item, animations);
    return app.Edit();
  }

  static async Create(animations?: AnimationConfig[]): Promise<SequenceItem | undefined> {
    const app = new SequenceItemEditor(undefined, undefined, animations);
    return app.Create();
  }

  static async Cancel(this: SequenceItemEditor) {
    await this.close();
  }

  static async Submit(this: SequenceItemEditor) {
    try {
      const data = getFormData<SequenceItem>(this.element as HTMLFormElement);
      if (this.resolve)
        this.resolve(data);
      this.resolve = this.reject = this.promise = undefined;
      await this.close();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }

  async Edit(item?: SequenceItem): Promise<SequenceItem | undefined> {
    if (item) this.item = item;
    const { promise, resolve, reject } = Promise.withResolvers<SequenceItem | undefined>();

    this.promise = promise;
    this.resolve = resolve;
    this.reject = reject;

    await this.render({ force: true });

    return promise;
  }

  async Create(): Promise<SequenceItem | undefined> {
    return this.Edit({
      ...foundry.utils.deepClone(DEFAULT_ANIMATION_SEQUENCE_ITEM),
      id: foundry.utils.randomID()
    });
  }

  _onClose(options: RenderOptions) {
    super._onClose(options);
    if (this.resolve)
      this.resolve();

    this.resolve = this.reject = this.promise = undefined;
  }

  async _prepareContext(options: RenderOptions) {
    const context = await super._prepareContext(options);

    context.idPrefix = foundry.utils.randomID();
    context.item = this.item!;

    context.animations = Object.fromEntries(
      this.animations!.map(anim => [anim.id, anim.name])
    );

    context.buttons = [
      { type: "button", action: "close", label: "Close", icon: `<i class="fa-solid fa-times"></i>` },
      { type: "submit", action: "submit", label: "Save", icon: `<i class="fa-solid fa-check"></i>` }
    ]

    return context;
  }

  constructor(options?: foundry.applications.api.ApplicationV2.Configuration, protected item?: SequenceItem, protected animations?: AnimationConfig[]) {
    super(options);

    if (!animations) this.animations = [];
  }
}