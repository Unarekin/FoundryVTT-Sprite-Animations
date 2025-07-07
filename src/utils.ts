import { AnimationConfig } from "./interfaces";

import mimeJSON from "./mime.json";
const mimeDB = mimeJSON as Record<string, string>;

function applyProperPixels(mesh: foundry.canvas.primary.PrimarySpriteMesh) {
  if (game.modules?.get("proper-pixels")?.active) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const enabled = (game.settings as any).get("proper-pixels", "affectTokens") ?? false;
    if (enabled) {
      mesh.texture?.baseTexture.setStyle(0, 0);
      mesh.texture?.baseTexture.update();
    }
  }
}

// function applyPixelPerfect(mesh: foundry.canvas.primary.PrimarySpriteMesh) {
//   if (game.modules?.get("pixel-perfect")?.active) {
//     mesh.texture?.update();
//   }
// }

function applyPixelCompatibility(mesh: foundry.canvas.primary.PrimarySpriteMesh) {
  applyProperPixels(mesh);
  // applyPixelPerfect(mesh);
}

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
  await playAnimations(mesh, [config]);
}

export async function playAnimations(mesh: foundry.canvas.primary.PrimarySpriteMesh, configs: AnimationConfig[]): Promise<void> {
  await preloadTextures(...configs);
  const filters = [...mesh.filters ?? []];

  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    mesh.texture = PIXI.Texture.from(config.src);

    // Re-apply filters
    if (mesh.filters) mesh.filters.splice(0, mesh.filters.length, ...filters);

    applyPixelCompatibility(mesh);

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


/**
 * Attempts to determine the MIME type of a given file
 * @param {string} path - File name/path
 * @returns 
 */
export function mimeType(path: string) {
  const ext = path.split(".").pop();
  if (!ext) return "application/octet-stream";
  else if (mimeDB[ext]) return mimeDB[ext];
  else return "application/octet-stream";
}