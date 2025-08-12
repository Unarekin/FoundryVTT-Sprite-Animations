import { AnimationConfigRenderContext, AnimationConfigRenderOptions, AnimationContext } from "./types";
import { AnimationConfig, Animatable, MeshAdjustmentConfig } from "interfaces";
type ApplicationType = typeof foundry.applications.api.ApplicationV2<foundry.applications.api.ApplicationV2.RenderContext, foundry.applications.api.ApplicationV2.Configuration>;
declare const MixedClass: foundry.applications.api.HandlebarsApplicationMixin.Mix<ApplicationType>;
export declare class SpriteAnimationsConfig extends MixedClass {
    readonly object: Animatable;
    static DEFAULT_OPTIONS: {
        window: {
            title: string;
            icon: string;
            contentClasses: string[];
            resizable: boolean;
        };
        position: {
            width: number;
        };
        tag: string;
        form: {
            closeOnSubmit: boolean;
            handler: typeof SpriteAnimationsConfig.onSubmit;
        };
        actions: {
            deleteAnimation: typeof SpriteAnimationsConfig.DeleteAnimation;
            addAnimation: typeof SpriteAnimationsConfig.AddAnimation;
        };
    };
    static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart>;
    protected readonly animations: AnimationContext[];
    protected readonly adjustments: MeshAdjustmentConfig;
    static AddAnimation(this: SpriteAnimationsConfig): Promise<void>;
    static DeleteAnimation(this: SpriteAnimationsConfig, e: Event, elem: HTMLElement): Promise<void>;
    _onChangeForm(config: foundry.applications.api.ApplicationV2.FormConfiguration, event: Event): void;
    static onSubmit(this: SpriteAnimationsConfig, e: Event | SubmitEvent, elem: HTMLFormElement, formData: foundry.applications.ux.FormDataExtended): Promise<void>;
    protected updatePreviews(): void;
    _preparePartContext(partId: string, context: AnimationConfigRenderContext, options: AnimationConfigRenderOptions): Promise<AnimationConfigRenderContext>;
    _prepareContext(options: AnimationConfigRenderOptions): Promise<AnimationConfigRenderContext>;
    protected parseAnimations(animations: AnimationConfig[]): AnimationContext[];
    protected parseForm(): AnimationConfig[];
    protected parseRow(row: HTMLElement): AnimationConfig;
    constructor(object: Animatable, options?: foundry.applications.api.HandlebarsApplicationMixin.Configuration);
}
export {};
