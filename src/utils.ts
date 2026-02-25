import { AnimationConfig } from "interfaces";
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

export function generatePreviewTooltip(animation: AnimationConfig): HTMLElement {
  const elem = document.createElement("div");
  const title = document.createElement("h4");
  title.innerText = animation.name;
  elem.appendChild(title);

  if (isVideo(animation.src)) {
    const vid = document.createElement("video");
    vid.width = 256;
    vid.autoplay = true;
    vid.loop = true;

    const src = document.createElement("source");
    src.src = animation.src;
    vid.appendChild(src);
    elem.appendChild(vid);
  } else {
    const img = document.createElement("img");
    img.src = animation.src;
    img.style.maxWidth = "256px";
    img.style.maxHeight = "256px";
    elem.appendChild(img);
  }
  return elem;
}

export function downloadJSON(json: object, name: string) {
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
  const objUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objUrl;
  link.download = name.endsWith(".json") ? name : `${name}.json`;
  link.click();
  URL.revokeObjectURL(objUrl);
}

export function uploadJSON<t = any>(): Promise<t> {
  return new Promise<t>((resolve, reject) => {
    const file = document.createElement("input");
    file.setAttribute("type", "file");
    file.setAttribute("accept", "application/json");
    file.onchange = e => {
      const file = (e.currentTarget as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error());
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        if (!e.target?.result) throw new Error();
        if (typeof e.target.result === "string") resolve(JSON.parse(e.target.result) as t);
      }

      reader.readAsText(file);
    }

    file.onerror = (event, source, line, col, error) => {
      if (error) reject(error);
      else reject(new Error(typeof event === "string" ? event : typeof undefined));
    }

    file.click();
  })
}

export function logImage(url: string, width = 256, height = 256) {
  const image = new Image();

  image.onload = function () {
    const style = [
      `font-size: 1px`,
      `padding-left: ${width}px`,
      `padding-bottom: ${height}px`,
      // `padding: ${this.height / 100 * size}px ${this.width / 100 * size}px`,
      `background: url(${url}) no-repeat`,
      `background-size:contain`,
      `border:1px solid black`,
      `max-width: 512px`
    ].join(";")
    console.log('%c ', style);
  }

  image.src = url;
}
