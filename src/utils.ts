import { AnimationConfig } from "./interfaces";

/**
 * Preloads animation textures for smoother transitioning between multiple.
 * @param {AnimationConfig[]} animations = {@link AnimationConfig}[]
 */
export async function preloadTextures(...animations: AnimationConfig[]): Promise<void> {
  try {
    const textures = animations.map(anim => anim.src);
    await PIXI.Assets.load(textures);
  } catch (err) {
    console.error(err);
    if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
  }
}

export async function playAnimation(mesh: foundry.canvas.primary.PrimarySpriteMesh, config: AnimationConfig): Promise<void> {
  await preloadTextures(config);
  const filters = [...mesh.filters ?? []];
  mesh.texture = PIXI.Texture.from(config.src);
  // Reinstate filters to make sure it updates
  if (mesh.filters) mesh.filters.splice(0, mesh.filters.length, ...filters);
  else mesh.filters = filters;

  if (mesh.texture.baseTexture.resource instanceof PIXI.VideoResource) {
    const { source } = mesh.texture.baseTexture.resource;
    source.currentTime = 0;
    await source.play();
    // Default loop to true
    source.loop = typeof config.loop === "boolean" ? config.loop : true;

    // If the animation is not looping, wait until it finishes.
    if (!source.loop) await animationEnd(mesh.texture.baseTexture.resource);
  }
}

export async function playAnimations(mesh: foundry.canvas.primary.PrimarySpriteMesh, configs: AnimationConfig[]): Promise<void> {
  await preloadTextures(...configs);
  const filters = [...mesh.filters ?? []];

  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    mesh.texture = PIXI.Texture.from(config.src);
    // Re-apply filters
    if (mesh.filters) mesh.filters.splice(0, mesh.filters.length, ...filters);

    const loop = (i < configs.length - 1 ? false : typeof config.loop == "boolean" ? config.loop : true);

    const { resource } = mesh.texture.baseTexture;
    if (resource instanceof PIXI.VideoResource) {
      const { source } = resource;
      source.currentTime = 0;
      await source.play();
      source.loop = loop;
      if (!loop) await animationEnd(resource);
    }
  }


}

async function animationEnd(resource: PIXI.VideoResource): Promise<void> {
  return new Promise(resolve => {
    resource.source.addEventListener("ended", () => {
      resolve();
    }, { once: true });
  })
}

// Hooks.once("init", () => {
//   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//   (CONFIG.Token.documentClass.prototype as any).setTexture = setTexture;
// });

// interface AnimationConfig {
//   src: string;
//   nextAnimation?: AnimationConfig;
//   revert?: boolean;
//   loop?: boolean;

// }

// async function setTexture(this: TokenDocument, config: AnimationConfig): Promise<void>;
// async function setTexture(this: TokenDocument, src: string): Promise<void>;
// async function setTexture(this: TokenDocument, arg: AnimationConfig | string): Promise<void> {
//   if (!this.object?.mesh) return;

//   const config: AnimationConfig = typeof arg === "string" ? { src: arg, revert: false, loop: true } : arg;
//   await preloadTextures(config);

//   let current: AnimationConfig | undefined = config;

//   while (current) {
//     this.object.mesh.texture = PIXI.Texture.from(current.src);
//     if (this.object.mesh.texture.baseTexture.resource instanceof PIXI.VideoResource) {
//       const { source } = this.object.mesh.texture.baseTexture.resource;
//       source.currentTime = 0;
//       await source.play();
//       source.loop = !current.nextAnimation;

//       await animationEnd(this.object.mesh.texture.baseTexture.resource);
//     }
//     current = current.nextAnimation;
//   }

// }

// async function animationEnd(resource: PIXI.VideoResource): Promise<void> {
//   return new Promise(resolve => {
//     resource.source.addEventListener("ended", () => {
//       resolve();
//     }, { once: true });
//   })
// }

// async function preloadTextures(config: AnimationConfig): Promise<void> {
//   const textures: string[] = [];
//   let current: AnimationConfig | undefined = config;
//   while (current) {
//     textures.push(current.src);
//     current = current.nextAnimation;
//   }

//   await PIXI.Assets.load(textures);
// }
