import { AnimationConfig } from "./interfaces";

declare global {
  interface FlagConfig {
    Actor: {
      "sprite-animations": {
        animations: AnimationConfig[];
      }
    },
    TileDocument: {
      "sprite-animations": {
        animations: AnimationConfig[];
      }
    }
  }
}

type Animatable = Actor | Tile | TileDocument;

/**
 * Retrieves all animations from an {@link Animatable}
 * @param {Animatable} target - {@link Animatable}
 * @returns {AnimationConfig[]}
 */
export function getAnimations(target: Animatable): AnimationConfig[] {
  if (target instanceof Actor) return target.getFlag("sprite-animations", "animations") ?? [];
  else if (target instanceof Tile) return target.document.getFlag("sprite-animations", "animations") ?? [];
  else if (target instanceof TileDocument) return target.getFlag("sprite-animations", "animations") ?? [];
  else return [];
}

/**
 * Retrieves an animation by name
 * @param {Animatable} actor - {@link Animatable}
 * @param {string} name - Name of the animation
 * @returns {AnimationConfig | undefined}
 */
export function getAnimation(target: Animatable, name: string): AnimationConfig | undefined {
  const animations = getAnimations(target);
  return animations.find(anim => anim.name === name);
}

/**
 * Adds an animation to an {@link Animatable}
 * @param {Animatable} target - {@link Animatable}
 * @param {AnimationConfig} config - {@link AnimationConfig}
 */
export async function addAnimation(target: Animatable, config: AnimationConfig): Promise<void> {
  const animations = getAnimations(target);
  const index = animations.findIndex(anim => anim.name === config.name);
  if (index !== -1) animations.splice(index, 1, config);
  else animations.push(config);

  await setAnimations(target, animations);
}

/**
 * Adds multiple animations to an {@link Animatable}
 * @param {Animatable} target - {@link Animatable}
 * @param {AnimationConfig[]} configs - {@link AnimationConfig}[]
 */
export async function addAnimations(target: Animatable, ...configs: AnimationConfig[]): Promise<void> {
  const animations = getAnimations(target).filter(anim => configs.findIndex(config => config.name === anim.name) !== -1);
  animations.push(...configs);
  await setAnimations(target, animations);
}

/**
 * Removes a set of animations from an {@link Animatable}
 * @param {Animatable} target - {@link Animatable}
 * @param {string[]} names - List of animations to remove
 */
export async function removeAnimations(target: Animatable, ...names: string[]): Promise<void> {
  const animations = getAnimations(target).filter(anim => names.includes(anim.name));
  await setAnimations(target, animations);
}

/**
 * Removes an animation from an {@link Animatable} by name
 * @param {Animatable} target - {@link Animatable}
 * @param {string} name - Name of the animation to remove
 */
export async function removeAnimation(target: Animatable, name: string): Promise<void> {
  const animations = getAnimations(target);
  const index = animations.findIndex(anim => anim.name === name);
  if (index !== -1) {
    animations.splice(index, 1);
    await setAnimations(target, animations);
  }
}

/**
 * Sets the given {@link Animatable}'s animations
 * @param {Animatable} target - {@link Animatable}
 * @param {AnimationConfig[]} animations - {@link AnimationConfig}[]
 */
export async function setAnimations(target: Animatable, animations: AnimationConfig[]): Promise<void> {
  // await target.setFlag("sprite-animations", "animations", animations);
  if (target instanceof Actor) await target.setFlag("sprite-animations", "animations", animations);
  else if (target instanceof Tile) await target.document.setFlag("sprite-animations", "animations", animations);
  else if (target instanceof TileDocument) await target.setFlag("sprite-animations", "animations", animations);
}

/**
 * Removes all animations from the given {@link Animatable}
 * @param {Animatable} target - {@link Animatable}
 */
export async function clearAnimations(target: Animatable): Promise<void> {
  await setAnimations(target, []);
}