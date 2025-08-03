import { AnimationConfig } from "./interfaces";

import mimeJSON from "./mime.json";
const mimeDB = mimeJSON as Record<string, string>;

const lastVideoElement: { mesh: foundry.canvas.primary.PrimarySpriteMesh, elem: HTMLVideoElement }[] = [];

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
    const assets = await PIXI.Assets.load(textures);
    await Promise.all(Object.values(assets).map((texture: PIXI.Texture) => {
      if (texture.valid) return Promise.resolve();
      return new Promise<void>(resolve => {
        texture.baseTexture.once("loaded", () => { resolve(); });
      });
    }))

  } catch (err) {
    console.error(err);
    if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
  }
}

export async function playAnimation(mesh: foundry.canvas.primary.PrimarySpriteMesh, config: AnimationConfig): Promise<void> {
  await playAnimations(mesh, [config]);
}

async function awaitTextureLoaded(texture: PIXI.Texture): Promise<void> {
  return new Promise<void>(resolve => {
    if (!texture.baseTexture.valid) {
      texture.baseTexture.once("loaded", () => {
        resolve();
      });
    } else {
      resolve();
    }
  })
}

async function applyTexture(mesh: foundry.canvas.primary.PrimarySpriteMesh, texture: PIXI.Texture): Promise<void> {
  await awaitTextureLoaded(texture);
  return new Promise<void>(resolve => {
    if (!canvas?.app) {
      resolve();
    } else {
      canvas.app.ticker.addOnce(() => {
        mesh.texture = texture;
        resolve();
      })
    }

  })
}

export async function playAnimations(mesh: foundry.canvas.primary.PrimarySpriteMesh, configs: AnimationConfig[]): Promise<void> {
  await preloadTextures(...configs);
  const filters = [...mesh.filters ?? []];

  const vidElements: HTMLVideoElement[] = [];

  const lastIndex = lastVideoElement.findIndex(elem => elem.mesh === mesh);
  if (lastIndex !== -1) {
    const lastElem = lastVideoElement[lastIndex]
    lastVideoElement.splice(lastIndex, 1);
    lastElem.elem.remove();
  }

  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];

    const loop = (i < configs.length - 1 ? false : typeof config.loop == "boolean" ? config.loop : true);

    if (isVideo(config.src)) {
      const vid = document.createElement("video");
      vidElements.push(vid);
      vid.src = config.src;
      vid.crossOrigin = "anonymous";
      vid.loop = loop;
      vid.autoplay = true;
      vid.playsInline = true;
      vid.style.display = "none";
      document.body.appendChild(vid);
      await vid.play();

      const index = lastVideoElement.findIndex(elem => elem.mesh === mesh);
      if (index !== -1) lastVideoElement[index].elem = vid;
      else lastVideoElement.push({ mesh, elem: vid });

      const texture = PIXI.Texture.from(vid);
      await applyTexture(mesh, texture);
    } else {
      const texture = PIXI.Texture.from(config.src);
      await applyTexture(mesh, texture);
    }

    // Re-apply filters
    if (mesh.filters) mesh.filters.splice(0, mesh.filters.length, ...filters);

    applyPixelCompatibility(mesh);


    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { resource } = (mesh.texture?.baseTexture as any);
    if (resource instanceof PIXI.VideoResource) {
      const { source } = resource;
      // Duplicate?
      source.currentTime = 0;
      await source.play();
      source.loop = loop;
      console.log("Awaiting animation end");
      if (!loop) await animationEnd(resource);
    }
  }
  if (vidElements.length > 1) {
    for (let i = 0; i < vidElements.length - 2; i++) {
      const elem = vidElements[i];
      elem.remove();
    }
  }
}

export async function queueAnimation(mesh: foundry.canvas.primary.PrimarySpriteMesh, config: AnimationConfig): Promise<void> {
  await queueAnimations(mesh, [config]);
}

export async function queueAnimations(mesh: foundry.canvas.primary.PrimarySpriteMesh, configs: AnimationConfig[]): Promise<void> {
  await preloadTextures(...configs);

  if (mesh.texture?.baseTexture.resource instanceof PIXI.VideoResource) {
    const source = mesh.texture.baseTexture.resource.source;
    // Ensure the video is actually playing and not already paused, ended, or just hasn't loaded yet
    if ((source.currentTime > 0 && !source.paused && !source.ended && source.readyState > 2)) {
      mesh.texture.baseTexture.resource.source.loop = false;
      await animationEnd(mesh.texture.baseTexture.resource);
    }
  }

  await playAnimations(mesh, configs);
}

export async function animationEnd(resource: PIXI.VideoResource): Promise<void> {
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

export function isVideo(path: string): boolean {
  return mimeType(path).split("/")[0] === "video";
}

export function isImage(path: string): boolean {
  return mimeType(path).split("/")[0] === "image";
}