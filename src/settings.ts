import { AnimationConfig } from "./interfaces";

declare global {
  interface FlagConfig {
    Actor: {
      "sprite-animations": {
        animations: AnimationConfig[];
      }
    }
  }
}

/**
 * Retrieves all animations from an actor
 * @param {Actor} actor - {@link Actor}
 * @returns {AnimationConfig[]}
 */
export function getAnimations(actor: Actor): AnimationConfig[] {
  return actor.getFlag("sprite-animations", "animations") ?? [];
}

/**
 * Retrieves an animation by name
 * @param {Actor} actor - {@link Actor}
 * @param {string} name - Name of the animation
 * @returns {AnimationConfig | undefined}
 */
export function getAnimation(actor: Actor, name: string): AnimationConfig | undefined {
  const animations = getAnimations(actor);
  return animations.find(anim => anim.name === name);
}

/**
 * Adds an animation to an {@link Actor}
 * @param {Actor} actor - {@link Actor}
 * @param {AnimationConfig} config - {@link AnimationConfig}
 */
export async function addAnimation(actor: Actor, config: AnimationConfig): Promise<void> {
  const animations = getAnimations(actor);
  const index = animations.findIndex(anim => anim.name === config.name);
  if (index !== -1) animations.splice(index, 1, config);
  else animations.push(config);
  await setAnimations(actor, animations);
}

/**
 * Adds multiple animations to an {@link Actor}
 * @param {Actor} actor - {@link Actor}
 * @param {AnimationConfig[]} configs - {@link AnimationConfig}[]
 */
export async function addAnimations(actor: Actor, ...configs: AnimationConfig[]): Promise<void> {
  const animations = getAnimations(actor).filter(anim => configs.findIndex(config => config.name === anim.name) !== -1);
  animations.push(...configs);
  await setAnimations(actor, animations);
}

export async function removeAnimations(actor: Actor, ...names: string[]): Promise<void> {
  const animations = getAnimations(actor).filter(anim => names.includes(anim.name));
  await setAnimations(actor, animations);
}

/**
 * Removes an animation from an {@link Actor} by name
 * @param {Actor} actor - {@link Actor}
 * @param {string} name - Name of the animation to remove
 */
export async function removeAnimation(actor: Actor, name: string): Promise<void> {
  const animations = getAnimations(actor);
  const index = animations.findIndex(anim => anim.name === name);
  if (index !== -1) {
    animations.splice(index, 1);
    await setAnimations(actor, animations);
  }
}

/**
 * Sets the given {@link Actor}'s animations
 * @param {Actor} actor - {@link Actor}
 * @param {AnimationConfig[]} animations - {@link AnimationConfig}[]
 */
export async function setAnimations(actor: Actor, animations: AnimationConfig[]): Promise<void> {
  await actor.setFlag("sprite-animations", "animations", animations);
}

/**
 * Removes all animations from the given {@link Actor}
 * @param {Actor} actor - {@link Actor}
 */
export async function clearAnimations(actor: Actor): Promise<void> {
  await setAnimations(actor, []);
}