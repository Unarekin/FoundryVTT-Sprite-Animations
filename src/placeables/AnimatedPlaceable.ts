import { DEFAULT_MESH_ADJUSTMENT } from "../constants";
import { AnimationConfig, AnimationFlags, MeshAdjustmentConfig, AnimatedPlaceable as AnimatedPlaceableInterface } from "interfaces";
import { AnimationArgument, DeepPartial } from "types";
import { animationEnd, isVideo } from "utils";
import { InvalidAnimationError, InvalidSpriteError } from "errors";
import { playAnimations as socketPlayAnimations, queueAnimations as socketQueueAnimations } from "../sockets";
import { canAnimatePlaceable } from "settings";

const lastVideoElement: { mesh: foundry.canvas.primary.PrimarySpriteMesh, elem: HTMLVideoElement }[] = [];

type PlaceableConstructor = new (...args: any[]) => foundry.canvas.placeables.PlaceableObject;

export function AnimatedPlaceableMixin<t extends PlaceableConstructor>(base: t): AnimatedPlaceableInterface & t {
  abstract class AnimatedPlaceable extends base implements AnimatedPlaceableInterface {

    // #region Abstract Methods
    protected abstract getAnimationFlags(): DeepPartial<AnimationFlags> | undefined;
    public abstract getMesh(): foundry.canvas.primary.PrimarySpriteMesh | undefined;
    protected abstract getDocumentSize(): { width: number, height: number };
    protected abstract resetAnimationMeshSize();
    // #endregion

    public getDocument(): foundry.abstract.Document.Any | undefined { return this.document; }

    protected previewAnimationAdjustments: MeshAdjustmentConfig | undefined = undefined;

    protected applyPixelCorrection() {
      // TODO: Handle Pixel Perfect module

      // Apply Proper Pixels adjustment if enabled
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      if (game.modules?.get("proper-pixels")?.active && !(game.modules?.get("tagger")?.active && globalThis.Tagger.hasTags(this, "ignore-pixel"))) {
        const mesh = this.getMesh();
        if (!mesh) return;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const enabled = (game.settings as any).get("proper-pixels", "affectTokens") ?? false;
        if (enabled) {
          mesh.texture?.baseTexture.setStyle(0, 0);
          mesh.texture?.baseTexture.update();
        }
      }
    }

    /**
     * Determines if a given user has permission to animate this placeable
     * @param {User} user - {@link User}
     */
    public canUserAnimate(user: User): boolean {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return canAnimatePlaceable(user, this as any);
    }

    /** Returns whether or not the current user can animate this placeable */
    public get canAnimate(): boolean {
      if (!game.user) return false;
      return this.canUserAnimate(game.user);
    }

    /**
     * Ensures textures for animations are preloaded for smoother transition between them
     * @param {AnimationConfig[]} anims - List of {@link AnimationConfig}[]
     */
    protected async preloadTextures(anims: AnimationConfig[]): Promise<void> {
      try {
        const textures = anims.map(anim => anim.src);
        const assets = await PIXI.Assets.load(textures);
        await Promise.all(Object.values(assets).map((texture: PIXI.Texture) => {
          // Ensure textures are actually loaded
          if (texture.valid) return Promise.resolve();
          return new Promise<void>(resolve => {
            texture.baseTexture.once("loaded", () => { resolve(); });
          });
        }));
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
      }
    }

    protected async applyTexture(texture: PIXI.Texture): Promise<void> {
      try {
        return new Promise<void>(resolve => {
          if (!canvas?.app) return;
          canvas.app.ticker.addOnce(() => {
            const mesh = this.getMesh();
            if (!mesh) throw new InvalidSpriteError(this);
            const oldTexture = mesh.texture;
            mesh.texture = texture;

            if (texture.baseTexture.resource instanceof PIXI.VideoResource) {
              void texture.baseTexture.resource.source.play()
            }

            // Clean up old video textures
            if (oldTexture?.baseTexture.resource instanceof PIXI.VideoResource) {
              const resource = oldTexture.baseTexture.resource;
              const { source } = resource;
              source.remove();
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            if ((this as any).refreshShadow) (this as any).refreshShadow(true);
            resolve();
          })
        });
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
      }
    }

    /** {@link AnimationConfig}[] */
    public get spriteAnimations() { return this.getAnimationFlags()?.animations ?? []; }

    /** {@link MeshAdjustmentConfig} */
    public get animationMeshAdjustments(): MeshAdjustmentConfig {
      const adjustments = foundry.utils.deepClone(DEFAULT_MESH_ADJUSTMENT);
      foundry.utils.mergeObject(adjustments, this.getAnimationFlags()?.meshAdjustments ?? {});
      return adjustments;
    }

    /** Attempts to retrieve a single {@link AnimationConfig} by name */
    public getAnimation(name: string): AnimationConfig | undefined { return this.spriteAnimations.find(item => item.name === name); }

    /** Simple wrapper to handle executing animations */
    protected async doPlayAnimations(animations: AnimationConfig[]): Promise<void> {
      try {
        const mesh = this.getMesh();
        if (!mesh) throw new InvalidSpriteError(this);

        void socketPlayAnimations(this.document.uuid, animations);
        await this.preloadTextures(animations);

        const filters = [...mesh.filters ?? []];

        // const vidElements: HTMLVideoElement[] = [];
        const lastIndex = lastVideoElement.findIndex(elem => elem.mesh === mesh);
        if (lastIndex !== -1) {
          const lastElem = lastVideoElement[lastIndex];
          lastVideoElement.splice(lastIndex, 1);
          lastElem.elem.remove();
        }

        for (let i = 0; i < animations.length; i++) {
          const config = animations[i];
          const loop = (i < animations.length - 1 ? false : typeof config.loop === "boolean" ? config.loop : true);


          if (isVideo(config.src)) {
            // We explicitly make a video element so that it can play at a different point
            // as the base resource, since PIXI will re-use video elements from its cache
            const vid = document.createElement("video");
            vid.src = config.src;
            vid.crossOrigin = "anonymous";
            vid.loop = loop;
            vid.playsInline = true;
            vid.style.display = "none";

            const texture = PIXI.Texture.from(config.src);
            await this.applyTexture(texture);
          } else {
            const texture = PIXI.Texture.from(config.src);
            await this.applyTexture(texture);
          }
          if (mesh.filters) mesh.filters.splice(0, mesh.filters.length, ...filters);
          else mesh.filters = [...filters];

          this.applyPixelCorrection();

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const { resource } = (mesh.texture?.baseTexture as any);
          if (resource instanceof PIXI.VideoResource) {
            const { source } = resource;
            source.currentTime = 0;
            await source.play();
            source.loop = loop;
            if (!loop) await animationEnd(resource);
          }
        }


      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
      }
    }

    /** Simple wrapper to handle queueing animations */
    protected async doQueueAnimations(animations: AnimationConfig[]): Promise<void> {
      try {
        const mesh = this.getMesh();
        if (!mesh) throw new InvalidSpriteError(this);

        void socketQueueAnimations(this.document.uuid, animations);
        await this.preloadTextures(animations);
        if (mesh.texture?.baseTexture.resource instanceof PIXI.VideoResource) {
          const { source } = mesh.texture.baseTexture.resource;
          if ((source.currentTime > 0 && !source.paused && !source.ended && source.readyState > 2)) {
            source.loop = false;
            await animationEnd(mesh.texture.baseTexture.resource);
          }
        }
        await this.doPlayAnimations(animations);
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
      }

    }

    /**
     * Ensures all arguments provided to other functions are valid animation names or {@link AnimationConfig}s
     * @param {AnimationArgument} args - Array of names or {@link AnimationConfig}
     * @returns Array of validated {@link AnimationConfig}
     * @throws Will throw {@link InvalidAnimationError} if any invalid arguments are provided
     */
    protected validateAnimationArguments(args: AnimationArgument[]): AnimationConfig[] {
      const animations = args.map(anim => typeof anim === "string" ? this.getAnimation(anim) : anim);
      const invalidIndex = animations.findIndex(item => !item);
      if (invalidIndex > -1) throw new InvalidAnimationError(args[invalidIndex]);
      return animations as AnimationConfig[];
    }

    protected getAnimationMeshAdjustmentMultipliers(): { x: number, y: number, width: number, height: number } {
      return {
        x: 1,
        y: 1,
        width: 1,
        height: 1
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public applyAnimationMeshAdjustments(adjustments: MeshAdjustmentConfig, force?: boolean) {
      this.resetAnimationMeshSize();
      if (!adjustments.enable) return;
      const mesh = this.getMesh();
      if (!mesh) return;
      mesh.position = this.center;


      const multipliers = this.getAnimationMeshAdjustmentMultipliers();

      mesh.x += adjustments.x * multipliers.x;
      mesh.y += adjustments.y * multipliers.y;
      mesh.width += adjustments.width * multipliers.width;
      mesh.height += adjustments.height * multipliers.height;
    }

    /**
     * Plays a series of animations
     * @param {AnimationArgument} args - Array of names or {@link AnimationConfig}
     */
    public async playAnimations(...args: AnimationArgument[]): Promise<void> {
      try {
        const animations = this.validateAnimationArguments(args);
        await this.doPlayAnimations(animations);
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
      }
    }

    /**
     * Plays a single animation
     * @param {AnimationArgument} anim - Name or {@link AnimationConfig}
     */
    public async playAnimation(anim: AnimationArgument): Promise<void> {
      try {
        const animation = this.validateAnimationArguments([anim]);
        await this.doPlayAnimations(animation);
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
      }
    }

    /**
     * Queues up an animation to play after any current ones playing
     * @param {AnimationArgument} anim - Name or {@link AnimationConfig}
     */
    public async queueAnimation(anim: AnimationArgument): Promise<void> {
      try {
        const animations = this.validateAnimationArguments([anim]);
        await this.doQueueAnimations(animations);
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
      }
    }

    /**
     * Queues up a set of animations to play after any current ones
     * @param {AnimationArgument} args - List of string or {@link AnimationConfig}
     */
    public async queueAnimations(...args: AnimationArgument[]): Promise<void> {
      try {
        const animations = this.validateAnimationArguments(args);
        await this.doQueueAnimations(animations);
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
      }
    }

    protected _refreshMesh() {
      console.log("Refresh mesh")
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      super._refreshMesh();
      // if (!this.sheet?.rendered && !this.isPreview)
      this.applyAnimationMeshAdjustments(this.previewAnimationAdjustments ?? this.animationMeshAdjustments);
    }

    protected _refreshSize() {
      console.log("Refresh size");

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      super._refreshSize();
      // if (!this.sheet?.rendered && !this.isPreview)
      this.applyAnimationMeshAdjustments(this.previewAnimationAdjustments ?? this.animationMeshAdjustments);
    }

    protected _refreshPosition() {
      console.log("Refresh position");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      super._refreshPosition();
      // if (!this.sheet?.rendered && !this.isPreview)
      this.applyAnimationMeshAdjustments(this.previewAnimationAdjustments ?? this.animationMeshAdjustments);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return AnimatedPlaceable as any;
}