import { DEFAULT_MESH_ADJUSTMENT } from "../constants";
import { AnimationConfig, AnimationFlags, MeshAdjustmentConfig, AnimatedPlaceable as AnimatedPlaceableInterface, AnimationSequence, AnimationQueueItem } from "interfaces";
import { AnimationArgument, DeepPartial } from "types";
import { animationEnd, wait } from "utils";
import { InvalidAnimationError, InvalidSpriteError } from "errors";
import { playAnimations as socketPlayAnimations, queueAnimations as socketQueueAnimations } from "../sockets";
import { canAnimatePlaceable } from "settings";

const lastVideoElement: { mesh: foundry.canvas.primary.PrimarySpriteMesh, elem: HTMLVideoElement }[] = [];

type PlaceableConstructor = new (...args: any[]) => foundry.canvas.placeables.PlaceableObject;

export function AnimatedPlaceableMixin<t extends PlaceableConstructor>(base: t): AnimatedPlaceableInterface & t {
  abstract class AnimatedPlaceable extends base implements AnimatedPlaceableInterface {

    // #region Abstract Methods
    public abstract getAnimationFlags(): DeepPartial<AnimationFlags> | undefined;
    public abstract getMesh(): foundry.canvas.primary.PrimarySpriteMesh | undefined;
    protected abstract getDocumentSize(): { width: number, height: number };
    protected abstract resetAnimationMeshSize(): void;
    // #endregion

    public getDocument(): foundry.abstract.Document.Any | undefined { return this.document; }

    public previewAnimationAdjustments: MeshAdjustmentConfig | undefined = undefined;

    public getFittedMeshSize(): { x: number, y: number, width: number, height: number } | undefined {
      const mesh = this.getMesh();
      if (!mesh) return;

      const { width, height, x, y } = mesh;
      this.resetAnimationMeshSize();
      mesh.position = this.center;

      const retVal = { x: mesh.x, y: mesh.y, width: mesh.width, height: mesh.height };
      mesh.width = width;
      mesh.height = height;
      mesh.x = x;
      mesh.y = y;
      return retVal;
    }

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
     * Ensures that any sounds associated with a set of animations are preloaded for smoother play
     * @param {AnimationConfig[]} anims - List of {@link AnimationConfig}[]
     */
    protected async preloadSounds(anims: AnimationConfig[]): Promise<void> {
      try {
        if (!game.audio) return;

        const sounds = anims.filter(anim => anim.sound && anim.volume).map(anim => anim.sound);
        await Promise.all(
          sounds.map(sound => game.audio?.preload(sound))
        )

      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
      }
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

    protected async playSound(animation: AnimationConfig, force = false) {
      try {
        if (!animation.enableSound && !force) return;
        if (!(animation.sound && animation.volume)) return;
        if (!game.audio) return;

        return game.audio.play(animation.sound, { volume: animation.volume ?? 1, context: game.audio.environment });
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

    /** {@link AnimationSequence[] } */
    public get spriteAnimationSequences() { return this.getAnimationFlags()?.sequences ?? []; }

    /** Attempts to retrieve a single {@link AnimationConfig} by name */
    public getAnimation(name: string): AnimationConfig | undefined { return this.spriteAnimations.find(item => item.name === name || item.id === name); }

    protected buildAnimationQueueSequence(sequence: AnimationSequence): AnimationQueueItem[] {
      const queue: AnimationQueueItem[] = [];

      for (const item of sequence.sequence) {
        const iterations = item.loopCount || 1;
        const anim = typeof item.animation === "string" ? this.getAnimation(item.animation) : item.animation as AnimationConfig;
        if (!anim) throw new InvalidAnimationError(item.animation);

        for (let i = 0; i < iterations; i++) {
          if (item.delay)
            queue.push({ type: "wait", data: { duration: item.delay } });
          queue.push({ type: "animation", data: anim });
        }
      }

      if (sequence.resetAnimation) {
        const anim = this.getAnimation(sequence.resetAnimation);
        if (anim)
          queue.push({ type: "animation", data: anim });
      }
      return queue;
    }

    protected buildAnimationQueue(animations: AnimationArgument[]): AnimationQueueItem[] {
      const queue: AnimationQueueItem[] = [];
      for (const entry of animations) {
        if (typeof entry === "string") {
          const seq = this.getAnimationSequence(entry);
          const anim = this.getAnimation(entry);
          if (seq) {
            queue.push(...this.buildAnimationQueueSequence(seq));
          } else if (anim) {
            queue.push({ type: "animation", data: anim });
          } else {
            throw new InvalidAnimationError(entry);
          }
        } else if ((entry as AnimationSequence).sequence) {
          queue.push(...this.buildAnimationQueueSequence(entry as AnimationSequence));
        } else {
          queue.push({ type: "animation", data: entry as AnimationConfig });
        }
      }

      return queue;
    }

    protected async doPlayAnimations(animations: (AnimationConfig | AnimationSequence)[], localOnly = false): Promise<void> {
      try {
        if (!animations.length) return void console.warn("No animations to play");
        const mesh = this.getMesh();
        if (!mesh) throw new InvalidSpriteError(this);
        if (!localOnly)
          void socketPlayAnimations(this.document.uuid, animations);

        // Preload
        const knownAnimations = animations.map(anim => {
          if ((anim as AnimationSequence).sequence) {
            return (anim as AnimationSequence).sequence.map(item => typeof item.animation === "string" ? this.getAnimation(item.animation) : item.animation);
          } else {
            return anim as AnimationConfig;
          }
        }).flat();

        const invalid = knownAnimations.some(item => !item);
        if (invalid) throw new InvalidAnimationError(undefined);

        await Promise.all([
          this.preloadTextures(knownAnimations as AnimationConfig[]),
          this.preloadSounds(knownAnimations as AnimationConfig[])
        ]);

        const lastIndex = lastVideoElement.findIndex(elem => elem.mesh === mesh);
        if (lastIndex !== -1) {
          const lastElem = lastVideoElement[lastIndex];
          lastVideoElement.splice(lastIndex, 1);
          lastElem.elem.remove();
        }

        const animationQueue = this.buildAnimationQueue(animations);
        console.log("Animation queue:", animationQueue);
        const lastAnimation = animationQueue.findLast(item => item.type === "animation");

        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < animationQueue.length; i++) {
          const queueItem = animationQueue[i];
          switch (queueItem.type) {
            case "wait": {
              await wait(queueItem.data.duration);
              break;
            }
            case "animation": {
              const config = queueItem.data;
              if (foundry.helpers.media.VideoHelper.hasVideoExtension(config.src)) {
                const texture = PIXI.Texture.from(config.src);
                await Promise.all([
                  this.applyTexture(texture),
                  this.playSound(config)
                ]);
              } else {
                const texture = PIXI.Texture.from(config.src);
                await Promise.all([
                  this.applyTexture(texture),
                  this.playSound(config)
                ]);
              }

              this.applyPixelCorrection();

              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              const { resource } = (mesh.texture?.baseTexture as any);
              if (resource instanceof PIXI.VideoResource) {
                const source = resource.source;
                source.loop = !!config.loop && (config === lastAnimation?.data);
                source.currentTime = 0;
                await source.play();
                if (!source.loop) await animationEnd(resource);
              }
              break;
            }
          }
        }

      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
      }
    }

    /** Simple wrapper to handle queueing animations */
    protected async doQueueAnimations(animations: AnimationConfig[], localOnly = false): Promise<void> {
      try {
        const mesh = this.getMesh();
        if (!mesh) throw new InvalidSpriteError(this);

        if (!localOnly)
          void socketQueueAnimations(this.document.uuid, animations);
        await Promise.all([
          this.preloadTextures(animations),
          this.preloadSounds(animations)
        ]);
        if (mesh.texture?.baseTexture.resource instanceof PIXI.VideoResource) {
          const { source } = mesh.texture.baseTexture.resource;
          if ((source.currentTime > 0 && !source.paused && !source.ended && source.readyState > 2)) {
            source.loop = false;
            await animationEnd(mesh.texture.baseTexture.resource);
          }
        }
        await this.doPlayAnimations(animations, localOnly);
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
      const animations = args.map(anim => {
        if (typeof anim === "string") {
          const seq = this.getAnimationSequence(anim);
          if (seq) return seq;
          return this.getAnimation(anim);
        } else {
          return anim;
        }
      });
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

      mesh.anchor.x = adjustments.anchor.x;
      mesh.anchor.y = adjustments.anchor.y;
    }

    /**
     * Plays a series of animations WITHOUT notifying remote clients
     * @param {AnimationArgument} args - Array of names or {@link AnimationConfig}
     */
    public async playLocalAnimations(...args: AnimationArgument[]): Promise<void> {
      try {
        const animations = this.validateAnimationArguments(args);
        await this.doPlayAnimations(animations, true);
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
      }
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

    protected getAnimationSequence(arg: string): AnimationSequence | undefined {
      return this.getAnimationFlags()?.sequences?.find(item => item.id === arg || item.name === arg);
    }

    /**
     * Plays a single animation
     * @param {AnimationArgument} anim - Name or {@link AnimationConfig}
     */
    public async playLocalAnimation(anim: AnimationArgument): Promise<void> {
      try {
        const animation = this.validateAnimationArguments([anim]);
        await this.doPlayAnimations(animation, true);
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
     * Queues up an animation to play after any current ones playing WITHOUT notifying remote clients
     * @param {AnimationArgument} anim - Name or {@link AnimationConfig}
     */
    public async queueLocalAnimation(anim: AnimationArgument): Promise<void> {
      try {
        const animations = this.validateAnimationArguments([anim]);
        await this.doQueueAnimations(animations, true);
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
     * Queues up a set of animations to play after any current ones WITHOUT notifying remote clients
     * @param {AnimationArgument} args - List of string or {@link AnimationConfig}
     */
    public async queueLocalAnimations(...args: AnimationArgument[]): Promise<void> {
      try {
        const animations = this.validateAnimationArguments(args);
        await this.doQueueAnimations(animations, true);
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      super._refreshMesh();
      // if (!this.sheet?.rendered && !this.isPreview)
      this.applyAnimationMeshAdjustments(this.previewAnimationAdjustments ?? this.animationMeshAdjustments);
    }

    protected _refreshSize() {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      super._refreshSize();
      // if (!this.sheet?.rendered && !this.isPreview)
      this.applyAnimationMeshAdjustments(this.previewAnimationAdjustments ?? this.animationMeshAdjustments);
    }

    protected _refreshPosition() {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      super._refreshPosition();
      // if (!this.sheet?.rendered && !this.isPreview)
      this.applyAnimationMeshAdjustments(this.previewAnimationAdjustments ?? this.animationMeshAdjustments);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return AnimatedPlaceable as any;
}