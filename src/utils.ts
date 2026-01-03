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

export function applyPixelCompatibility(mesh: foundry.canvas.primary.PrimarySpriteMesh) {
  applyProperPixels(mesh);
  // applyPixelPerfect(mesh);
}


export async function awaitTextureLoaded(texture: PIXI.Texture): Promise<void> {
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