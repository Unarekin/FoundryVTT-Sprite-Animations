import { InvalidSpriteError, PermissionDeniedError } from "./errors";
import { coerceAnimatable, coerceSprite } from "coercion";
import { AnimatedPlaceable, AnimationConfig } from "interfaces";
import { getAnimations } from "settings";
import { AnimationArgument } from "types";


type AnimatableArgument = Actor | foundry.canvas.placeables.Tile | foundry.canvas.placeables.Token | TileDocument | TokenDocument;

export class SpriteAnimator {
  public readonly actor: Actor | null = null;
  public readonly object: Token | Tile | null;
  public readonly document: TokenDocument | TileDocument;

  // #region Statis Methods

  /**
   * Retrieves an {@link AnimationConfig} from a given object by name
   * @param {AnimatableArgument} arg - {@link AnimatableArgument}
   * @param {string} name - Name of the animation
   * @returns - {@link AnimationConfig}
   */
  public static getAnimation(arg: AnimatableArgument, name: string): AnimationConfig | undefined {
    try {
      const animatable = coerceAnimatable(arg);
      if (!animatable) throw new InvalidSpriteError(arg);
      return this.getAnimation(animatable, name);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Retrieves all animations from a given {@link AnimatableArgument}
   * @param {AnimatableArgument} arg - {@link AnimatableArgument}
   * @returns - {@link AnimationConfig}[]
   */
  public static getAnimations(arg: AnimatableArgument): AnimationConfig[] | undefined {
    try {
      const animatable = coerceAnimatable(arg);
      if (!animatable) throw new InvalidSpriteError(animatable);
      return getAnimations(animatable);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Queues an animation to play after the current one finishes, if any
   * @param {AnimatedPlaceable} target - {@link AnimatedPlaceable}
   * @param {AnimationArgument} anim - {@link AnimationArgument}
   * @returns 
   */
  public static async queueAnimation(target: AnimatedPlaceable, anim: AnimationArgument): Promise<void> {
    try {
      if (!game.user) throw new PermissionDeniedError();
      const sprite = coerceSprite(target);
      if (!sprite) throw new InvalidSpriteError(target);
      return sprite.queueAnimation(anim);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Queues multiple animations to play after the current one finishes
   * @param {AnimatedPlaceable} target - {@link AnimatedPlaceable}
   * @param {AnimationArgument} anims - {@link AnimationArgument}[]
   */
  public static async queueAnimations(target: AnimatedPlaceable, anims:AnimationArgument[]): Promise<void> {
    try {
      if (!game.user) throw new PermissionDeniedError();
      const sprite = coerceSprite(target);
      if (!sprite) throw new InvalidSpriteError(target);
      return sprite.queueAnimations(...anims);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Plays an animation immediately
   * @param {AnimatedPlaceable} target - {@link AnimatedPlaceable}
   * @param {AnimationArgument} anim - {@link AnimationArgument}
   * @returns 
   */
  public static async playAnimation(target: AnimatableArgument, anim: AnimationArgument): Promise<void> {
    try {
      if (!game.user) throw new PermissionDeniedError();
      const sprite = coerceSprite(target);
      if (!sprite) throw new InvalidSpriteError(target);
      return sprite.playAnimation(anim);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Play a set of animations immediately
   * @param {AnimatedPlaceable} target - {@link AnimatedPlaceable}
   * @param {AnimationArgument} anims - {@link AnimationArgument}[]
   * @returns 
   */
  public static async playAnimations(target: AnimatableArgument, anims: AnimationArgument[]): Promise<void> {
    try {
      if (!game.user) throw new PermissionDeniedError();
      const sprite = coerceSprite(target);
      if (!sprite) throw new InvalidSpriteError(target);
      return sprite.playAnimations(...anims);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  // #endregion

  // #region Instance Methods

  /**
   * Retrieves an {@link AnimationConfig} by name
   * @param {string} name - Name of the animation
   */
  public getAnimation(name: string): AnimationConfig | undefined {
    if (this.object) return SpriteAnimator.getAnimation(this.object, name);
    else if (this.actor) return SpriteAnimator.getAnimation(this.actor, name);
    else if (this.document?.object) return SpriteAnimator.getAnimation(this.document.object, name);
    throw new InvalidSpriteError(this.object ?? this.actor ?? this.document);
  }

  /**
   * Retrieves all {@link AnimationConfig}s for this object
   * @returns - {@link AnimationConfig}[]
   */
  public getAnimations(): AnimationConfig[] {
    if (this.object) return SpriteAnimator.getAnimations(this.object) ?? [];
    else if (this.actor) return SpriteAnimator.getAnimations(this.actor) ?? [];
    else if (this.document?.object) return SpriteAnimator.getAnimations(this.document.object) ?? [];
    throw new InvalidSpriteError(this.object ?? this.actor ?? this.document);
  }

  /**
   * Plays an animation immediately
   * @param {AnimationArgument} animation - {@link AnimationArgument}
   * @returns 
   */
  public async playAnimation(animation: AnimationArgument): Promise<void> {
    if (this.object) return SpriteAnimator.playAnimation(this.object, animation);
    else if (this.document?.object) return SpriteAnimator.playAnimation(this.document.object, animation);
    throw new InvalidSpriteError(this.object ?? this.document);
  }

  /**
   * Plays a series of animations immediately
   * @param {AnimationArgument} animations - {@link AnimationArgument}[]
   * @returns 
   */
  public async playAnimations(animations: AnimationArgument[]): Promise<void> {
    if (this.object) return SpriteAnimator.playAnimations(this.object, animations);
    else if (this.document?.object) return SpriteAnimator.playAnimations(this.document.object, animations);
    throw new InvalidSpriteError(this.object ?? this.document);
  }

  // #endregion
  constructor(arg: unknown) {
    const sprite = coerceSprite(arg);
    if (!sprite) throw new InvalidSpriteError(arg);
    if (!sprite.canAnimate) throw new PermissionDeniedError();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.object = sprite as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    this.document = (sprite as any).document;
    if (sprite instanceof Token) this.actor = sprite.actor;
  }
}