import { SpriteAnimator } from "./SpriteAnimator";
import "./settings";

Hooks.once("init", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (window as any).SpriteAnimator = SpriteAnimator;
})

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
