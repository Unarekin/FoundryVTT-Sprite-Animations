import { AnimationConfig, MeshAdjustmentConfig } from "./interfaces";
import { Animatable } from "./interfaces";
declare global {
    interface SettingsConfig {
        "sprite-animations": {
            animateOtherTokens: boolean;
        };
    }
    interface FlagConfig {
        Actor: {
            "sprite-animations": {
                animations: AnimationConfig[];
                meshAdjustments: MeshAdjustmentConfig;
            };
        };
        TileDocument: {
            "sprite-animations": {
                animations: AnimationConfig[];
                meshAdjustments: MeshAdjustmentConfig;
            };
        };
    }
}
export declare function canAnimatePlaceable(user: User, target: Token | TokenDocument | Tile | TileDocument | Actor): boolean;
export declare function applyMeshAdjustments(target: Token | TokenDocument | Tile | TileDocument): void;
export declare function getMeshAdjustments(target: Animatable): MeshAdjustmentConfig | undefined;
export declare function setMeshAdjustments(target: Animatable, adjustments: Partial<MeshAdjustmentConfig>): Promise<void>;
/**
 * Retrieves all animations from an {@link Animatable}
 * @param {Animatable} target - {@link Animatable}
 * @returns {AnimationConfig[]}
 */
export declare function getAnimations(target: Animatable): AnimationConfig[];
/**
 * Retrieves an animation by name
 * @param {Animatable} actor - {@link Animatable}
 * @param {string} name - Name of the animation
 * @returns {AnimationConfig | undefined}
 */
export declare function getAnimation(target: Animatable, name: string): AnimationConfig | undefined;
/**
 * Adds an animation to an {@link Animatable}
 * @param {Animatable} target - {@link Animatable}
 * @param {AnimationConfig} config - {@link AnimationConfig}
 */
export declare function addAnimation(target: Animatable, config: AnimationConfig): Promise<void>;
/**
 * Adds multiple animations to an {@link Animatable}
 * @param {Animatable} target - {@link Animatable}
 * @param {AnimationConfig[]} configs - {@link AnimationConfig}[]
 */
export declare function addAnimations(target: Animatable, ...configs: AnimationConfig[]): Promise<void>;
/**
 * Removes a set of animations from an {@link Animatable}
 * @param {Animatable} target - {@link Animatable}
 * @param {string[]} names - List of animations to remove
 */
export declare function removeAnimations(target: Animatable, ...names: string[]): Promise<void>;
/**
 * Removes an animation from an {@link Animatable} by name
 * @param {Animatable} target - {@link Animatable}
 * @param {string} name - Name of the animation to remove
 */
export declare function removeAnimation(target: Animatable, name: string): Promise<void>;
/**
 * Sets the given {@link Animatable}'s animations
 * @param {Animatable} target - {@link Animatable}
 * @param {AnimationConfig[]} animations - {@link AnimationConfig}[]
 */
export declare function setAnimations(target: Animatable, animations: AnimationConfig[]): Promise<void>;
/**
 * Removes all animations from the given {@link Animatable}
 * @param {Animatable} target - {@link Animatable}
 */
export declare function clearAnimations(target: Animatable): Promise<void>;
