import { AnimationConfig } from "interfaces";
import { InvalidActorError, InvalidAnimationError, InvalidTokenError } from "./errors";
import { coerceActor } from "coercion";
import { addAnimation, addAnimations, clearAnimations, getAnimation, getAnimations, removeAnimation, removeAnimations } from "settings";
import { playAnimation, playAnimations } from "./utils";

export class SpriteAnimator {
  public readonly actor: Actor;
  public readonly object: Token | null;
  public readonly document: TokenDocument;

  // #region Static Methods

  /**
   * Retrieves animation by name.
   * @param {Token} token - {@link Token}
   * @param {string} name - Name of the animation
   */
  public static getAnimation(token: Token, name: string): AnimationConfig | undefined
  /**
   * Retrieves animation by name.
   * @param {TokenDocument} token - {@link TokenDocument}
   * @param {string} name - Name of the animation
   */
  public static getAnimation(token: TokenDocument, name: string): AnimationConfig | undefined
  /**
   * Retrieves animation by name.
   * @param {Actor} actor - {@link Actor}
   * @param {string} name - Name of the animation
   */
  public static getAnimation(actor: Actor, name: string): AnimationConfig | undefined
  public static getAnimation(arg: unknown, name: string): AnimationConfig | undefined {
    try {
      const actor = coerceActor(arg);
      if (!(actor instanceof Actor)) throw new InvalidActorError(arg);
      return getAnimation(actor, name);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Retrieves all animations for the {@link Actor} associated with a given {@link Token}
   * @param {Token} token - {@link Token}
   */
  public static getAnimations(token: Token): AnimationConfig[]
  /**
   * Retrieves all animations for the {@link Actor} associated with a given {@link TokenDocument}
   * @param {TokenDocument} token - {@link TokenDocument}
   */
  public static getAnimations(token: TokenDocument): AnimationConfig[]
  /**
   * Retrieves all animations for a given {@link Actor}
   * @param {Actor} actor - {@link Actor}
   */
  public static getAnimations(actor: Actor): AnimationConfig[]
  public static getAnimations(arg: unknown): AnimationConfig[] | undefined {
    try {
      const actor = coerceActor(arg);
      if (!(actor instanceof Actor)) throw new InvalidActorError(arg);
      return getAnimations(actor);
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
   * Play an animation by name
   * @param {Token} token - {@link Token}
   * @param {string} name - Name of the animation to play
   */
  public static async playAnimation(token: Token, name: string): Promise<void>
  /**
   * Play an animation by name
   * @param {Token} token - {@link Token}
   * @param {string} name - Name of the animation to play
   */
  public static async playAnimation(token: TokenDocument, name: string): Promise<void>
  /**
   * Play an animation
   * @param {Token} token - {@link Token}
   * @param {AnimationConfig} animation - {@link AnimationConfig}
   */
  public static async playAnimation(token: Token, animation: AnimationConfig): Promise<void>
  /**
   * Play an animation
   * @param {TokenDocument} token - {@link TokenDocument}
   * @param {AnimationConfig} animation - {@link AnimationConfig}
   */
  public static async playAnimation(token: TokenDocument, animation: AnimationConfig): Promise<void>
  public static async playAnimation(arg: unknown, anim: string | AnimationConfig): Promise<void> {
    try {
      const actor = coerceActor(arg);
      if (!(actor instanceof Actor)) throw new InvalidActorError(arg);
      const animation: AnimationConfig | undefined = typeof anim === "string" ? getAnimation(actor, anim) : anim;
      if (!animation) throw new InvalidAnimationError(anim);
      await playAnimation(actor, animation);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  /**
   * Plays a sequence of animations on a given {@link Token}
   * @param {Token} token - {@link Token}
   * @param {string | AnimationConfig} args - An array of strings or {@link AnimationConfig}s
   */
  public static async playAnimations(token: Token, ...args: (string | AnimationConfig)[]): Promise<void>
  /**
   * Plays a sequence of animations on a given {@link TokenDocument}
   * @param {TokenDocument} token - {@link TokenDocument}
   * @param {string | AnimationConfig} args - An array of strings or {@link AnimationConfig}s
   */
  public static async playAnimations(token: TokenDocument, ...args: (string | AnimationConfig)[]): Promise<void>
  public static async playAnimations(arg: unknown, ...args: (string | AnimationConfig)[]): Promise<void> {
    try {
      const token = arg instanceof Token ? arg : arg instanceof TokenDocument ? arg.object : undefined;
      if (!token?.mesh) throw new InvalidTokenError(arg);

      const actor = coerceActor(token);
      if (!(actor instanceof Actor)) throw new InvalidActorError(actor);

      const animations = args.map(arg => typeof arg === "string" ? getAnimation(actor, arg) : arg);
      const hasInvalid = animations.find(anim => !anim);
      if (hasInvalid) throw new InvalidAnimationError(hasInvalid);
      await playAnimations(token.mesh, animations as AnimationConfig[]);

    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  // #endregion

  // #region Instance Methods

  /**
   * Adds an animation to the current {@link Actor}
   * @param {AnimationConfig} animation - {@link AnimationConfig}
   */
  public async addAnimation(animation: AnimationConfig): Promise<void> {
    try {
      await addAnimation(this.actor, animation);
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
      await addAnimations(this.actor, ...animations);
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
      await removeAnimation(this.actor, name);
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
      await removeAnimations(this.actor, ...names);
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
      await clearAnimations(this.actor);
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
    return getAnimations(this.actor);
  }

  /**
   * Retrieves an animation from the current {@link Actor} by name
   * @param {string} name - Name of the animation to retrieve
   * @returns - {@link AnimationConfig} | undefined
   */
  public getAnimation(name: string): AnimationConfig | undefined {
    return getAnimation(this.actor, name);
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
      const config: AnimationConfig | undefined = typeof arg === "string" ? this.getAnimation(arg) : arg;
      if (!config) throw new InvalidAnimationError(arg);
      if (!this.object?.mesh) throw new InvalidTokenError(this.object);
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
      if (!this.object?.mesh) throw new InvalidTokenError(this.object);

      const animations = args.map(arg => typeof arg === "string" ? this.getAnimation(arg) : arg);
      const hasInvalid = animations.find(anim => !anim);
      if (hasInvalid) throw new InvalidAnimationError(hasInvalid);
      await playAnimations(this.object.mesh, animations as AnimationConfig[]);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  // #endregion
  constructor(token: Token)
  constructor(token: TokenDocument)
  constructor(arg: unknown) {

    if (arg instanceof Token) {
      if (!(arg.actor instanceof Actor)) throw new InvalidActorError(arg.actor);
      this.object = arg;
      this.document = arg.document
      this.actor = arg.actor;
    } else if (arg instanceof TokenDocument) {
      if (!(arg.actor instanceof Actor)) throw new InvalidActorError(arg.actor);
      this.document = arg;
      this.object = arg.object;
    } else {
      throw new InvalidTokenError(arg);
    }

    const actor = coerceActor(arg);
    if (!(actor instanceof Actor)) throw new InvalidActorError(arg);
    this.actor = actor;
  }
}