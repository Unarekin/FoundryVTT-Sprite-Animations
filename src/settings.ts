import { AnimationConfig, MeshAdjustmentConfig } from "./interfaces";
import { Animatable } from "./interfaces";
import { DEFAULT_MESH_ADJUSTMENT } from "./constants";
import { coerceAnimatable } from "coercion";



declare global {

  interface SettingsConfig {
    "sprite-animations": {
      animateOtherTokens: boolean;
    }
  }

  interface FlagConfig {
    Actor: {
      "sprite-animations": {
        animations: AnimationConfig[];
        meshAdjustments: MeshAdjustmentConfig;
      }
    },
    TileDocument: {
      "sprite-animations": {
        animations: AnimationConfig[];
        meshAdjustments: MeshAdjustmentConfig;
      }
    }
  }
}

Hooks.on("ready", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  (game.settings as any)?.register(__MODULE_ID__, "animateOtherTokens", {
    name: "SPRITE-ANIMATIONS.SETTINGS.ANIMATEOTHERS.LABEL",
    hint: "SPRITE-ANIMATIONS.SETTINGS.ANIMATEOTHERS.HINT",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  (game.settings as any)?.register(__MODULE_ID__, "collapseHeaderButton", {
    name: "SPRITE-ANIMATIONS.SETTINGS.COLLAPSEHEADERBUTTON.LABEL",
    hint: "SPRITE-ANIMATIONS.SETTINGS.COLLAPSEHEADERBUTTON.HINT",
    scope: "client",
    config: true,
    type: Boolean,
    default: false
  });
})

export function canAnimatePlaceable(user: User, target: Token | TokenDocument | Tile | TileDocument | Actor): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  if ((game?.settings as any)?.get(__MODULE_ID__, "animateOtherTokens")) return true;
  if (target instanceof Tile || target instanceof Token) {
    if (target.can(user, "update")) return true;
  } else {
    if (target.canUserModify(user, "update")) return true;
  }



  return false;
}

export function applyMeshAdjustments(target: Token | TokenDocument | Tile | TileDocument) {
  try {
    if (!canvas?.scene) return;
    const animatable = coerceAnimatable(target);
    if (!animatable) return;
    const adjustments = getMeshAdjustments(animatable);

    const mesh = animatable instanceof Tile ? animatable.mesh : animatable instanceof TileDocument ? animatable.object?.mesh : target instanceof Token ? target.mesh : target instanceof TokenDocument ? target.object?.mesh : undefined;
    if (!mesh) return;


    const doc = (target instanceof Token || target instanceof Tile) ? target.document : target;
    if (!doc) return;

    // Determine base height of mesh, before applying scale.
    // let meshScale = 1;
    const baseWidth = doc instanceof TileDocument ? doc.width : (doc.width * canvas.scene.dimensions.size);
    const baseHeight = doc instanceof TileDocument ? doc.height : (doc.height * canvas.scene.dimensions.size);

    if (!doc.object?.texture) return;
    if (!mesh.texture) return;

    const { width: textureWidth, height: textureHeight } = mesh.texture;
    let sx;
    let sy;
    switch (doc.texture.fit) {
      case "fill":
        sx = baseWidth / textureWidth;
        sy = baseHeight / textureHeight;
        break;
      case "cover":
        sx = sy = Math.max(baseWidth / textureWidth, baseHeight / textureHeight);
        break;
      case "contain":
        sx = sy = Math.min(baseWidth / textureWidth, baseHeight / textureHeight);
        break;
      case "width":
        sx = sy = baseWidth / textureWidth;
        break;
      case "height":
        sx = sy = baseHeight / textureHeight;
        break;
    }

    sx *= doc.texture.scaleX;
    sy *= doc.texture.scaleY;

    mesh.scale.set(sx, sy);
    if (adjustments?.enable) {

      const adjustWidth = doc instanceof TileDocument ? doc.width / canvas.scene.dimensions.size : doc.width;
      const adjustHeight = doc instanceof TileDocument ? doc.height / canvas.scene.dimensions.size : doc.height;

      mesh.width += (adjustments.width * adjustWidth);
      mesh.height += (adjustments.height * adjustHeight);
      mesh.x = doc.x + (baseWidth * mesh.anchor.x);
      mesh.y = doc.y + (baseHeight * mesh.anchor.y);

      if (doc.texture.scaleX < 0) mesh.x -= (adjustments.x * adjustWidth);
      else if (doc.texture.scaleX > 0) mesh.x += (adjustments.x * adjustWidth);

      if (doc.texture.scaleY < 0) mesh.y -= (adjustments.y * adjustHeight);
      else if (doc.texture.scaleY > 0) mesh.y += (adjustments.y * adjustHeight);

    } else {
      // Ensure mesh position is where it ought to be when unadjusted
      mesh.x = doc.x + (baseWidth * mesh.anchor.x);
      mesh.y = doc.y + (baseHeight * mesh.anchor.y);
    }
  } catch (err) {
    if (err instanceof Error) ui.notifications?.error(err.message, { localize: true });
  }
}

function ensureDefaultAdjustments(adjustments: Partial<MeshAdjustmentConfig>): MeshAdjustmentConfig {
  const newAdjustments = {};
  foundry.utils.mergeObject(newAdjustments, DEFAULT_MESH_ADJUSTMENT);
  foundry.utils.mergeObject(newAdjustments, adjustments);

  return newAdjustments as MeshAdjustmentConfig;
}

export function getMeshAdjustments(target: Animatable): MeshAdjustmentConfig | undefined {

  if (target instanceof Actor) return ensureDefaultAdjustments(target.getFlag("sprite-animations", "meshAdjustments"));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  else if (target instanceof Tile) return ensureDefaultAdjustments((target.document as any).getFlag("sprite-animations", "meshAdjustments") as MeshAdjustmentConfig);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  else if (target instanceof TileDocument) return ensureDefaultAdjustments((target as any).getFlag("sprite-animations", "meshAdjustments") as MeshAdjustmentConfig);

}

export async function setMeshAdjustments(target: Animatable, adjustments: Partial<MeshAdjustmentConfig>): Promise<void> {
  if (target instanceof Actor) await target.setFlag("sprite-animations", "meshAdjustments", ensureDefaultAdjustments(adjustments));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  else if (target instanceof Tile) await (target.document as any).setFlag("sprite-animations", "meshAdjustments", ensureDefaultAdjustments(adjustments));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  else if (target instanceof TileDocument) await (target as any).setFlag("sprite-animations", "meshAdjustments", ensureDefaultAdjustments(adjustments));
}

/**
 * Retrieves all animations from an {@link Animatable}
 * @param {Animatable} target - {@link Animatable}
 * @returns {AnimationConfig[]}
 */
export function getAnimations(target: Animatable): AnimationConfig[] {
  if (target instanceof Actor) return target.getFlag("sprite-animations", "animations") ?? [];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  else if (target instanceof Tile) return (target.document as any).getFlag("sprite-animations", "animations") as AnimationConfig[] ?? [];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  else if (target instanceof TileDocument) return (target as any).getFlag("sprite-animations", "animations") as AnimationConfig[] ?? [];
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  else if (target instanceof Tile) await (target.document as any).setFlag("sprite-animations", "animations", animations);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  else if (target instanceof TileDocument) await (target as any).setFlag("sprite-animations", "animations", animations);
}

/**
 * Removes all animations from the given {@link Animatable}
 * @param {Animatable} target - {@link Animatable}
 */
export async function clearAnimations(target: Animatable): Promise<void> {
  await setAnimations(target, []);
}