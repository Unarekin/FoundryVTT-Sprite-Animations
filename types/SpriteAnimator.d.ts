import { AnimatedPlaceable, AnimationConfig } from "interfaces";
import { AnimationArgument } from "types";
type AnimatableArgument = Actor | foundry.canvas.placeables.Tile | foundry.canvas.placeables.Token | TileDocument | TokenDocument;
export declare class SpriteAnimator {
    readonly actor: Actor | null;
    readonly object: Token | Tile | null;
    readonly document: TokenDocument | TileDocument;
    /**
     * Retrieves an {@link AnimationConfig} from a given object by name
     * @param {AnimatableArgument} arg - {@link AnimatableArgument}
     * @param {string} name - Name of the animation
     * @returns - {@link AnimationConfig}
     */
    static getAnimation(arg: AnimatableArgument, name: string): AnimationConfig | undefined;
    /**
     * Retrieves all animations from a given {@link AnimatableArgument}
     * @param {AnimatableArgument} arg - {@link AnimatableArgument}
     * @returns - {@link AnimationConfig}[]
     */
    static getAnimations(arg: AnimatableArgument): AnimationConfig[] | undefined;
    /**
     * Queues an animation to play after the current one finishes, if any
     * @param {AnimatedPlaceable} target - {@link AnimatedPlaceable}
     * @param {AnimationArgument} anim - {@link AnimationArgument}
     * @returns
     */
    static queueAnimation(target: AnimatedPlaceable, anim: AnimationArgument): Promise<void>;
    /**
     * Queues multiple animations to play after the current one finishes
     * @param {AnimatedPlaceable} target - {@link AnimatedPlaceable}
     * @param {AnimationArgument} anims - {@link AnimationArgument}[]
     */
    static queueAnimations(target: AnimatedPlaceable, ...anims: AnimationArgument[]): Promise<void>;
    /**
     * Plays an animation immediately
     * @param {AnimatedPlaceable} target - {@link AnimatedPlaceable}
     * @param {AnimationArgument} anim - {@link AnimationArgument}
     * @returns
     */
    static playAnimation(target: AnimatableArgument, anim: AnimationArgument): Promise<void>;
    /**
     * Play a set of animations immediately
     * @param {AnimatedPlaceable} target - {@link AnimatedPlaceable}
     * @param {AnimationArgument} anims - {@link AnimationArgument}[]
     * @returns
     */
    static playAnimations(target: AnimatableArgument, ...anims: AnimationArgument[]): Promise<void>;
    /**
     * Retrieves an {@link AnimationConfig} by name
     * @param {string} name - Name of the animation
     */
    getAnimation(name: string): AnimationConfig | undefined;
    /**
     * Retrieves all {@link AnimationConfig}s for this object
     * @returns - {@link AnimationConfig}[]
     */
    getAnimations(): AnimationConfig[];
    /**
     * Plays an animation immediately
     * @param {AnimationArgument} animation - {@link AnimationArgument}
     * @returns
     */
    playAnimation(animation: AnimationArgument): Promise<void>;
    /**
     * Plays a series of animations immediately
     * @param {AnimationArgument} animations - {@link AnimationArgument}[]
     * @returns
     */
    playAnimations(...animations: AnimationArgument[]): Promise<void>;
    /**
     * Plays a series of animations after the current one finishes
     * @param {AnimationArgument} animations - {@link AnimationArgument}
     * @returns
     */
    queueAnimations(...animations: AnimationArgument[]): Promise<void>;
    constructor(arg: unknown);
}
export {};
