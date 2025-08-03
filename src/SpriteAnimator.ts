import { AnimationConfig } from "interfaces";
import { InvalidActorError, InvalidAnimationError, InvalidSpriteError, InvalidTokenError, PermissionDeniedError } from "./errors";
import { coerceActor, coerceAnimatable, coerceAnimation, coerceSprite } from "coercion";
import { addAnimation, addAnimations, canAnimatePlaceable, clearAnimations, getAnimation, getAnimations, removeAnimation, removeAnimations } from "settings";
import { playAnimation, playAnimations, queueAnimation, queueAnimations } from "./utils";
import { playAnimations as socketPlayAnimations, queueAnimations as socketQueueAnimations } from "./sockets";

export class SpriteAnimator {
  public readonly actor: Actor | null = null;
  public readonly object: Token | Tile | null;
  public readonly document: TokenDocument | TileDocument;

  // #region Static Methods


  /**
   * Retrieves an animation by name.
   * @param {Token | Tile | TileDocument | Actor} arg 
   * @param {string} name 
   * @returns 
   */
  public static getAnimation(arg: unknown, name: string): AnimationConfig | undefined {
    try {
      const animatable = coerceAnimatable(arg);
      if (!animatable) throw new InvalidSpriteError(animatable);
      return getAnimation(animatable, name);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }


  /**
   * Retrieves all animations from an object
   * @param arg 
   * @returns 
   */
  public static getAnimations(arg: unknown): AnimationConfig[] | undefined {
    try {
      const animatable = coerceAnimatable(arg);
      if (!animatable) throw new InvalidSpriteError(arg);
      return getAnimations(animatable);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }


  /**
   * Add an animation to the {@link Actor} for a given {@link Token}
   * @param {Token} token - {@link Token}
   * @param {AnimationConfig} config - {@link AnimationConfig}
   */
  public static async addAnimation(token: Token, config: AnimationConfig): Promise<void>
  /**
   * Add an animation to the {@link Actor} for a given {@link TokenDocument}
   * @param {TokenDocument} token - {@link TokenDocument}
   * @param {AnimationConfig} config - {@link AnimationConfig}
   */
  public static async addAnimation(token: TokenDocument, config: AnimationConfig): Promise<void>
  /**
   * Add an animation to the given {@link Actor}
   * @param {Actor} actor - {@link Actor}
   * @param {AnimationConfig} config - {@link AnimationConfig} 
   */
  public static async addAnimation(actor: Actor, config: AnimationConfig): Promise<void>
  public static async addAnimation(arg: unknown, config: AnimationConfig): Promise<void> {
    try {
      const actor = coerceActor(arg);
      if (!(actor instanceof Actor)) throw new InvalidActorError(arg);
      await addAnimation(actor, config);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Adds a set of animations to the {@link Actor} associated with a given {@link Token}
   * @param {Token} token - {@link Token}
   * @param {AnimationConfig[]} configs - {@link AnimationConfig}[]
   */
  public static async addAnimations(token: Token, ...configs: AnimationConfig[]): Promise<void>
  /**
   * Adds a set of animations to the {@link Actor} associated with a given {@link TokenDocument}
   * @param {TokenDocument} token - {@link TokenDocument}
   * @param {AnimationConfig[]} configs - {@link AnimationConfig}[]
   */
  public static async addAnimations(token: TokenDocument, ...configs: AnimationConfig[]): Promise<void>
  /**
   * Adds a set of animations to the given {@link Actor}
   * @param {Actor} actor - {@link Actor}
   * @param {AnimationConfig[]} configs - {@link AnimationConfig}[]
   */
  public static async addAnimations(actor: Actor, ...configs: AnimationConfig[]): Promise<void>
  public static async addAnimations(arg: unknown, ...configs: AnimationConfig[]): Promise<void> {
    try {
      const actor = coerceActor(arg);
      if (!(actor instanceof Actor)) throw new InvalidActorError(arg);
      await addAnimations(actor, ...configs);

    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Removes an animation from the {@link Actor} associated with the given {@link Token}
   * @param {Token} token - {@link Token}
   * @param {string} name - Name of the animation to remove
   */
  public static async removeAnimation(token: Token, name: string): Promise<void>
  /**
   * Removes an animation from the {@link Actor} associated with the given {@link TokenDocument}
   * @param {Token} token - {@link Token}
   * @param {string} name - Name of the animation to remove
   */
  public static async removeAnimation(token: TokenDocument, name: string): Promise<void>
  /**
   * Removes an animation from the given {@link Actor}
   * @param {Actor} actor - {@link Actor}
   * @param {string} name - Name of the animation to remove
   */
  public static async removeAnimation(actor: Actor, name: string): Promise<void>
  public static async removeAnimation(arg: unknown, name: string): Promise<void> {
    try {
      const actor = coerceActor(arg);
      if (!(actor instanceof Actor)) throw new InvalidActorError(arg);
      await removeAnimation(actor, name);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Removes a set of animations from the {@link Actor} associated with a given {@link Token}
   * @param {Token} token - {@link Token}
   * @param {string[]} names - Names of the animations to remove
   */
  public static async removeAnimations(token: Token, ...names: string[]): Promise<void>
  /**
   * Removes a set of animations from the {@link Actor} associated with a given {@link TokenDocument}
   * @param {TokenDocument} token - {@link TokenDocument}
   * @param {string[]} names - Names of the animations to remove
   */
  public static async removeAnimations(token: TokenDocument, ...names: string[]): Promise<void>
  /**
   * Removes a set of animations from a given {@link Actor}
   * @param {Actor} actor - {@link Actor}
   * @param {string[]} names - Names of the animations to remove
   */
  public static async removeAnimations(actor: Actor, ...names: string[]): Promise<void>
  public static async removeAnimations(arg: unknown, ...names: string[]): Promise<void> {
    try {
      const actor = coerceActor(arg);
      if (!(actor instanceof Actor)) throw new InvalidActorError(arg);
      await removeAnimations(actor, ...names);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }


  /**
   * Removes all animations from the {@link Actor} associated with a given {@link Token}
   * @param {Token} token - {@link Token}
   */
  public static async clearAnimations(token: Token): Promise<void>
  /**
   * Removes all animations from the {@link Actor} associated with a given {@link TokenDocument}
   * @param {TokenDocument} token - {@link TokenDocument}
   */
  public static async clearAnimations(token: TokenDocument): Promise<void>
  /**
   * Removes all animations from a given {@link Actor}
   * @param {Actor} actor - {@link Actor}
   */
  public static async clearAnimations(actor: Actor): Promise<void>
  public static async clearAnimations(arg: unknown): Promise<void> {
    try {
      const actor = coerceActor(arg);
      if (!(actor instanceof Actor)) throw new InvalidActorError(arg);
      await clearAnimations(actor);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Will play an animation after the current one ends, if one is playing.
   * @param {Token | TokenDocument | Tile | TileDocument} target = {@link Token} or {@link TokenDocument}
   * @param {string | AnimationConfig} anim - {@link AnimationConfig} or name of an animation}
   */
  public static async queueAnimation(target: Token | TokenDocument | Tile | TileDocument | string, anim: string | AnimationConfig): Promise<void> {
    try {
      if (!game.user) throw new PermissionDeniedError();
      const sprite = coerceSprite(target);
      if (!sprite?.mesh) throw new InvalidSpriteError(target);
      if (!canAnimatePlaceable(game.user, sprite)) throw new PermissionDeniedError();

      const animation = coerceAnimation(anim, sprite);
      if (!animation) throw new InvalidAnimationError(anim);

      void socketQueueAnimations(sprite.document.uuid, [animation]);
      await queueAnimation(sprite.mesh, animation);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Will play a set of animations after the current one ends, if one is playing
   * @param {Token | TokenDocument | Tile | TileDocument} target - {@link Token} or {@link TokenDocument}
   * @param {string | AnimationConfig} anims - Array of {@link AnimationConfig}s or strings
   */
  public static async queueAnimations(target: Token | TokenDocument | Tile | TileDocument | string, ...anims: (string | AnimationConfig)[]): Promise<void> {
    try {
      const sprite = coerceSprite(target);
      if (!sprite?.mesh) throw new InvalidSpriteError(target);
      const animations = anims.map(anim => coerceAnimation(anim, sprite));
      const hasInvalid = animations.find(anim => !anim);
      if (hasInvalid) throw new InvalidAnimationError(hasInvalid);

      void socketQueueAnimations(sprite.document.uuid, animations as AnimationConfig[]);
      await queueAnimations(sprite.mesh, animations as AnimationConfig[]);

    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Plays an animation for a given target
   * @param {Token | TokenDocument | string} target - {@link Token}, {@link TokenDocument}, or id
   * @param {string | AnimationConfig} anim - Name of the animation or {@link AnimationConfig}
   */
  public static async playAnimation(target: Token | TokenDocument | Tile | TileDocument | string, anim: string | AnimationConfig): Promise<void> {
    try {

      const sprite = coerceSprite(target);
      if (!(sprite instanceof Token || sprite instanceof Tile)) throw new InvalidSpriteError(target);

      if (!(game.user && canAnimatePlaceable(game.user, sprite.document))) throw new PermissionDeniedError();
      if (!sprite.mesh) throw new InvalidSpriteError(target);

      // Validate animation
      const animation = coerceAnimation(anim, sprite);
      if (!animation) throw new InvalidAnimationError(anim);

      void socketPlayAnimations(sprite.document.uuid, [animation]);
      await playAnimation(sprite.mesh, animation);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Plays a series of animations by name or {@link AnimationConfig}
   * @param {Token | TokenDocument | string} target - {@link Token}, {@link TokenDocument}, or id/uuid
   * @param {string | AnimationConfig} anims - Array of strings or {@link AnimationConfig}
   */
  public static async playAnimations(target: Token | TokenDocument | Tile | TileDocument | string, ...anims: (string | AnimationConfig)[]): Promise<void> {
    try {
      const sprite = coerceSprite(target);
      if (!sprite?.mesh) throw new InvalidSpriteError(target);
      if (!(game.user && canAnimatePlaceable(game.user, sprite))) throw new PermissionDeniedError();
      const animations = anims.map(anim => coerceAnimation(anim, sprite));
      const hasInvalid = animations.find(anim => !anim);
      if (hasInvalid) throw new InvalidAnimationError(hasInvalid);

      void socketPlayAnimations(sprite.document.uuid, animations as AnimationConfig[]);
      await playAnimations(sprite.mesh, animations as AnimationConfig[]);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }


  // #endregion

  // #region Instance Methods

  /**
   * Play an animation after the current one finishes, if one is playing.
   * @param {Token | TokenDocument | Tile | TileDocument} target - {@link Token} or {@link TokenDocument}
   * @param {string | AnimationConfig} anim - {@link AnimationConfig} or name of an animation
   */
  public async queueAnimation(arg: string | AnimationConfig): Promise<void> {
    try {
      if (!(game.user && canAnimatePlaceable(game.user, this.document))) throw new PermissionDeniedError();
      const config = coerceAnimation(arg, this.document);
      if (!config) throw new InvalidAnimationError(arg);
      if (!this.object?.mesh) throw new InvalidTokenError(this.object);


      void socketQueueAnimations(this.document.uuid, [config]);
      await queueAnimation(this.object.mesh, config);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Play a set of animations after the current one ends, if one is playing.
   * @param {Token | TokenDocument | Tile | TileDocument} target - {@link Token} or {@link TokenDocument}
   * @param {string | AnimationConfig} anims - Array of strings or {@link AnimationConfig}s.
   */
  public async queueAnimations(...args: (string | AnimationConfig)[]): Promise<void> {
    try {
      if (!(game.user && canAnimatePlaceable(game.user, this.document))) throw new PermissionDeniedError();
      if (!this.object?.mesh) throw new InvalidTokenError(this.object);

      const animations = args.map(arg => coerceAnimation(arg, this.document));
      const hasInvalid = animations.find(anim => !anim);
      if (hasInvalid) throw new InvalidAnimationError(hasInvalid);

      void socketQueueAnimations(this.document.uuid, animations as AnimationConfig[]);
      await queueAnimations(this.object.mesh, animations as AnimationConfig[]);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Adds an animation to the current {@link Actor}
   * @param {AnimationConfig} animation - {@link AnimationConfig}
   */
  public async addAnimation(animation: AnimationConfig): Promise<void> {
    try {
      if (this.actor instanceof Actor) await addAnimation(this.actor, animation);
      else if (this.document instanceof TileDocument) await addAnimation(this.document, animation);
      // This one shouldn't be reached, but we have it just in case.
      else if (this.object instanceof Tile) await addAnimation(this.object, animation);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Add a set of animations to the current {@link Actor}
   * @param {AnimationConfig[]} animations - {@link AnimationConfig}[]
   */
  public async addAnimations(...animations: AnimationConfig[]): Promise<void> {
    try {
      if (this.actor instanceof Actor) await addAnimations(this.actor, ...animations);
      else if (this.document instanceof TileDocument) await addAnimations(this.document, ...animations);
      // This one shouldn't be reached, but just in case
      else if (this.object instanceof Tile) await addAnimations(this.object, ...animations);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Removes an animation from the current {@link Actor}
   * @param {string} name - Name of the animation to remove
   */
  public async removeAnimation(name: string): Promise<void> {
    try {
      if (this.actor instanceof Actor) await removeAnimation(this.actor, name);
      else if (this.document instanceof TileDocument) await removeAnimation(this.document, name);
      // This one shouldn't be reached, but just in case
      else if (this.object instanceof Tile) await removeAnimation(this.object, name);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Remove a set of animations from the current {@link Actor}
   * @param {string[]} names - Names of the animations to remove
   */
  public async removeAnimations(...names: string[]): Promise<void> {
    try {
      if (this.actor instanceof Actor) await removeAnimations(this.actor, ...names);
      else if (this.document instanceof TileDocument) await removeAnimations(this.document, ...names);
      // This one shouldn't be reached, but just in case
      else if (this.object instanceof Tile) await removeAnimations(this.object, ...names);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Removes all animations from the current {@link Actor}
   */
  public async clearAnimations(): Promise<void> {
    try {
      if (this.actor instanceof Actor) await clearAnimations(this.actor);
      else if (this.document instanceof TileDocument) await clearAnimations(this.document);
      // This one shouldn't be reached, but just in case
      else if (this.object instanceof Tile) await clearAnimations(this.object);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Retrieves all animations from the current {@link Actor}
   * @returns - {@link AnimationConfig}[]
   */
  public getAnimations(): AnimationConfig[] {
    if (this.actor instanceof Actor) return getAnimations(this.actor);
    else if (this.document instanceof TileDocument) return getAnimations(this.document);
    else if (this.object instanceof Tile) return getAnimations(this.object);
    else return [];
  }

  /**
   * Retrieves an animation from the current {@link Actor} by name
   * @param {string} name - Name of the animation to retrieve
   * @returns - {@link AnimationConfig} | undefined
   */
  public getAnimation(name: string): AnimationConfig | undefined {
    if (this.actor instanceof Actor) return getAnimation(this.actor, name);
    else if (this.document instanceof TileDocument) return getAnimation(this.document, name);
    else if (this.object instanceof Tile) return getAnimation(this.object, name);
  }

  /**
   * Play an animation for the current {@link Actor}
   * @param {string} name - Name of the animation to play
   * @returns A promise that resolves when the animation has finished, unless the animation is set to loop
   */
  public async playAnimation(name: string): Promise<void>
  /**
   * Play ana nimation for the current {@link Actor}
   * @param {AnimationConfig} config - {@link AnimationConfig}
   * @returns A promise that resolves when the animation has finished, unless the animation is set to loop
   */
  public async playAnimation(config: AnimationConfig): Promise<void>
  public async playAnimation(arg: string | AnimationConfig): Promise<void> {
    try {
      if (!(game.user && canAnimatePlaceable(game.user, this.document))) throw new PermissionDeniedError();
      const config = coerceAnimation(arg, this.document);
      if (!config) throw new InvalidAnimationError(arg);
      if (!this.object?.mesh) throw new InvalidTokenError(this.object);

      void socketPlayAnimations(this.document.uuid, [config]);
      await playAnimation(this.object.mesh, config);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Plays a series of animations in sequence
   * @param {string | AnimationConfig} args - A list of animations by name or {@link AnimationConfig}
   */
  public async playAnimations(...args: (string | AnimationConfig)[]): Promise<void> {
    try {
      if (!(game.user && canAnimatePlaceable(game.user, this.document))) throw new PermissionDeniedError();
      if (!this.object?.mesh) throw new InvalidTokenError(this.object);

      const animations = args.map(arg => coerceAnimation(arg, this.document));
      const hasInvalid = animations.find(anim => !anim);
      if (hasInvalid) throw new InvalidAnimationError(hasInvalid);

      void socketPlayAnimations(this.document.uuid, animations as AnimationConfig[]);
      await playAnimations(this.object.mesh, animations as AnimationConfig[]);

    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  // #endregion
  constructor(arg: unknown) {
    const sprite = coerceSprite(arg);
    if (!sprite) throw new InvalidSpriteError(arg);
    if (!(game.user && canAnimatePlaceable(game.user, sprite.document))) throw new PermissionDeniedError();
    this.object = sprite;
    this.document = sprite.document;
    if (sprite instanceof Token) this.actor = sprite.actor;
  }
}