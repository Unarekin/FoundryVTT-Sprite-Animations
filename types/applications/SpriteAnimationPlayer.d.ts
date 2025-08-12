import { AnimationContext, AnimationPlayerRenderContext, AnimationPlayerRenderOptions } from "./types";
import { AnimationConfig } from "interfaces";
type ApplicationType = typeof foundry.applications.api.ApplicationV2<foundry.applications.api.ApplicationV2.RenderContext, foundry.applications.api.ApplicationV2.Configuration>;
declare const MixedClass: foundry.applications.api.HandlebarsApplicationMixin.Mix<ApplicationType>;
export declare class SpriteAnimationPlayer extends MixedClass {
    readonly sprite: Token | Tile;
    readonly actor: Actor | null;
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
        };
        actions: {
            playAnimation: typeof SpriteAnimationPlayer.PlayAnimation;
            queueAnimation: typeof SpriteAnimationPlayer.QueueAnimation;
            removeQueueItem: typeof SpriteAnimationPlayer.RemoveQueueItem;
            clearQueue: typeof SpriteAnimationPlayer.ClearQueue;
            playQueue: typeof SpriteAnimationPlayer.PlayQueue;
        };
    };
    static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart>;
    static PlayQueue(this: SpriteAnimationPlayer): Promise<void>;
    static ClearQueue(this: SpriteAnimationPlayer): Promise<void>;
    static RemoveQueueItem(this: SpriteAnimationPlayer, e: Event, elem: HTMLElement): Promise<void>;
    protected updateQueueButtons(): void;
    protected animationQueue: AnimationConfig[];
    static QueueAnimation(this: SpriteAnimationPlayer, e: Event, elem: HTMLElement): Promise<void>;
    protected updateQueue(): Promise<void>;
    protected _onRender(context: AnimationPlayerRenderContext, options: AnimationPlayerRenderOptions): Promise<void>;
    static PlayAnimation(this: SpriteAnimationPlayer, e: Event, elem: HTMLElement): Promise<void>;
    protected parseAnimations(animations: AnimationConfig[]): AnimationContext[];
    _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<AnimationPlayerRenderContext>;
    constructor(sprite: Token | Tile, options?: foundry.applications.api.HandlebarsApplicationMixin.Configuration);
}
export {};
