import { AnimationConfig } from "interfaces";
export declare class SpriteAnimator {
    readonly actor: Actor | null;
    readonly object: Token | Tile | null;
    readonly document: TokenDocument | TileDocument;
    /**
     * Retrieves an animation by name.
     * @param {Token | Tile | TileDocument | Actor} arg
     * @param {string} name
     * @returns
     */
    static getAnimation(arg: unknown, name: string): AnimationConfig | undefined;
    /**
     * Retrieves all animations from an object
     * @param arg
     * @returns
     */
    static getAnimations(arg: unknown): AnimationConfig[] | undefined;
    /**
     * Add an animation to the {@link Actor} for a given {@link Token}
     * @param {Token} token - {@link Token}
     * @param {AnimationConfig} config - {@link AnimationConfig}
     */
    static addAnimation(token: Token, config: AnimationConfig): Promise<void>;
    /**
     * Add an animation to the {@link Actor} for a given {@link TokenDocument}
     * @param {TokenDocument} token - {@link TokenDocument}
     * @param {AnimationConfig} config - {@link AnimationConfig}
     */
    static addAnimation(token: TokenDocument, config: AnimationConfig): Promise<void>;
    /**
     * Add an animation to the given {@link Actor}
     * @param {Actor} actor - {@link Actor}
     * @param {AnimationConfig} config - {@link AnimationConfig}
     */
    static addAnimation(actor: Actor, config: AnimationConfig): Promise<void>;
    /**
     * Adds a set of animations to the {@link Actor} associated with a given {@link Token}
     * @param {Token} token - {@link Token}
     * @param {AnimationConfig[]} configs - {@link AnimationConfig}[]
     */
    static addAnimations(token: Token, ...configs: AnimationConfig[]): Promise<void>;
    /**
     * Adds a set of animations to the {@link Actor} associated with a given {@link TokenDocument}
     * @param {TokenDocument} token - {@link TokenDocument}
     * @param {AnimationConfig[]} configs - {@link AnimationConfig}[]
     */
    static addAnimations(token: TokenDocument, ...configs: AnimationConfig[]): Promise<void>;
    /**
     * Adds a set of animations to the given {@link Actor}
     * @param {Actor} actor - {@link Actor}
     * @param {AnimationConfig[]} configs - {@link AnimationConfig}[]
     */
    static addAnimations(actor: Actor, ...configs: AnimationConfig[]): Promise<void>;
    /**
     * Removes an animation from the {@link Actor} associated with the given {@link Token}
     * @param {Token} token - {@link Token}
     * @param {string} name - Name of the animation to remove
     */
    static removeAnimation(token: Token, name: string): Promise<void>;
    /**
     * Removes an animation from the {@link Actor} associated with the given {@link TokenDocument}
     * @param {Token} token - {@link Token}
     * @param {string} name - Name of the animation to remove
     */
    static removeAnimation(token: TokenDocument, name: string): Promise<void>;
    /**
     * Removes an animation from the given {@link Actor}
     * @param {Actor} actor - {@link Actor}
     * @param {string} name - Name of the animation to remove
     */
    static removeAnimation(actor: Actor, name: string): Promise<void>;
    /**
     * Removes a set of animations from the {@link Actor} associated with a given {@link Token}
     * @param {Token} token - {@link Token}
     * @param {string[]} names - Names of the animations to remove
     */
    static removeAnimations(token: Token, ...names: string[]): Promise<void>;
    /**
     * Removes a set of animations from the {@link Actor} associated with a given {@link TokenDocument}
     * @param {TokenDocument} token - {@link TokenDocument}
     * @param {string[]} names - Names of the animations to remove
     */
    static removeAnimations(token: TokenDocument, ...names: string[]): Promise<void>;
    /**
     * Removes a set of animations from a given {@link Actor}
     * @param {Actor} actor - {@link Actor}
     * @param {string[]} names - Names of the animations to remove
     */
    static removeAnimations(actor: Actor, ...names: string[]): Promise<void>;
    /**
     * Removes all animations from the {@link Actor} associated with a given {@link Token}
     * @param {Token} token - {@link Token}
     */
    static clearAnimations(token: Token): Promise<void>;
    /**
     * Removes all animations from the {@link Actor} associated with a given {@link TokenDocument}
     * @param {TokenDocument} token - {@link TokenDocument}
     */
    static clearAnimations(token: TokenDocument): Promise<void>;
    /**
     * Removes all animations from a given {@link Actor}
     * @param {Actor} actor - {@link Actor}
     */
    static clearAnimations(actor: Actor): Promise<void>;
    /**
     * Will play an animation after the current one ends, if one is playing.
     * @param {Token | TokenDocument | Tile | TileDocument} target = {@link Token} or {@link TokenDocument}
     * @param {string | AnimationConfig} anim - {@link AnimationConfig} or name of an animation}
     */
    static queueAnimation(target: Token | TokenDocument | Tile | TileDocument | string, anim: string | AnimationConfig): Promise<void>;
    /**
     * Will play a set of animations after the current one ends, if one is playing
     * @param {Token | TokenDocument | Tile | TileDocument} target - {@link Token} or {@link TokenDocument}
     * @param {string | AnimationConfig} anims - Array of {@link AnimationConfig}s or strings
     */
    static queueAnimations(target: Token | TokenDocument | Tile | TileDocument | string, ...anims: (string | AnimationConfig)[]): Promise<void>;
    /**
     * Plays an animation for a given target
     * @param {Token | TokenDocument | string} target - {@link Token}, {@link TokenDocument}, or id
     * @param {string | AnimationConfig} anim - Name of the animation or {@link AnimationConfig}
     */
    static playAnimation(target: Token | TokenDocument | Tile | TileDocument | string, anim: string | AnimationConfig): Promise<void>;
    /**
     * Plays a series of animations by name or {@link AnimationConfig}
     * @param {Token | TokenDocument | string} target - {@link Token}, {@link TokenDocument}, or id/uuid
     * @param {string | AnimationConfig} anims - Array of strings or {@link AnimationConfig}
     */
    static playAnimations(target: Token | TokenDocument | Tile | TileDocument | string, ...anims: (string | AnimationConfig)[]): Promise<void>;
    /**
     * Play an animation after the current one finishes, if one is playing.
     * @param {Token | TokenDocument | Tile | TileDocument} target - {@link Token} or {@link TokenDocument}
     * @param {string | AnimationConfig} anim - {@link AnimationConfig} or name of an animation
     */
    queueAnimation(arg: string | AnimationConfig): Promise<void>;
    /**
     * Play a set of animations after the current one ends, if one is playing.
     * @param {Token | TokenDocument | Tile | TileDocument} target - {@link Token} or {@link TokenDocument}
     * @param {string | AnimationConfig} anims - Array of strings or {@link AnimationConfig}s.
     */
    queueAnimations(...args: (string | AnimationConfig)[]): Promise<void>;
    /**
     * Adds an animation to the current {@link Actor}
     * @param {AnimationConfig} animation - {@link AnimationConfig}
     */
    addAnimation(animation: AnimationConfig): Promise<void>;
    /**
     * Add a set of animations to the current {@link Actor}
     * @param {AnimationConfig[]} animations - {@link AnimationConfig}[]
     */
    addAnimations(...animations: AnimationConfig[]): Promise<void>;
    /**
     * Removes an animation from the current {@link Actor}
     * @param {string} name - Name of the animation to remove
     */
    removeAnimation(name: string): Promise<void>;
    /**
     * Remove a set of animations from the current {@link Actor}
     * @param {string[]} names - Names of the animations to remove
     */
    removeAnimations(...names: string[]): Promise<void>;
    /**
     * Removes all animations from the current {@link Actor}
     */
    clearAnimations(): Promise<void>;
    /**
     * Retrieves all animations from the current {@link Actor}
     * @returns - {@link AnimationConfig}[]
     */
    getAnimations(): AnimationConfig[];
    /**
     * Retrieves an animation from the current {@link Actor} by name
     * @param {string} name - Name of the animation to retrieve
     * @returns - {@link AnimationConfig} | undefined
     */
    getAnimation(name: string): AnimationConfig | undefined;
    /**
     * Play an animation for the current {@link Actor}
     * @param {string} name - Name of the animation to play
     * @returns A promise that resolves when the animation has finished, unless the animation is set to loop
     */
    playAnimation(name: string): Promise<void>;
    /**
     * Play ana nimation for the current {@link Actor}
     * @param {AnimationConfig} config - {@link AnimationConfig}
     * @returns A promise that resolves when the animation has finished, unless the animation is set to loop
     */
    playAnimation(config: AnimationConfig): Promise<void>;
    /**
     * Plays a series of animations in sequence
     * @param {string | AnimationConfig} args - A list of animations by name or {@link AnimationConfig}
     */
    playAnimations(...args: (string | AnimationConfig)[]): Promise<void>;
    constructor(arg: unknown);
}
