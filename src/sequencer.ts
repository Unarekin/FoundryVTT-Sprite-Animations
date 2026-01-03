import { InvalidAnimationError, InvalidSpriteError, LocalizedError } from "errors";
import { Animatable, AnimatedPlaceable, AnimationConfig } from "./interfaces";
import { coerceAnimation, coerceSprite } from "coercion";

let sectionManagerClass: Class;

type TokenLike = AnimatedPlaceable;

export function getSectionManager(): Class {
  if (sectionManagerClass) {
    return sectionManagerClass;
  } else {

    class SpriteAnimationManager extends Sequencer.BaseSection {

      static niceName = "SpriteAnimation";

      private _target: TokenLike | undefined = undefined;;
      private _animations: (string | AnimationConfig)[] = [];
      private _immediate = false;
      private _loop: boolean | undefined = undefined;

      private _remote = false;

      private setTarget(target: unknown) {
        if (this._target) throw new LocalizedError("TARGETALREADYSET");
        const sprite = coerceSprite(target);
        if (!sprite) throw new InvalidSpriteError(target);
        this._target = sprite;
      }

      /**
       * Sets the target for this sequence 
       * @param {Animatable} target - {@link Animatable}
       */
      on(target: Animatable): this {
        this.setTarget(target);
        return this;
      }

      /**
       * Queues up animations to play
       * @param animations 
       */
      add(...animations: (string | AnimationConfig)[]): this {
        const coerced = this._animations.map(anim => coerceAnimation(anim, this._target)) as AnimationConfig[];
        if (coerced.some(anim => !anim)) throw new InvalidAnimationError(animations.find(anim => !anim));

        this._animations.push(...animations);
        return this;
      }

      /**
       * Override the loop property for the final animation in this sequence.
       * @param {boolean} loop 
       */
      loop(loop = true): this {
        this._loop = loop;
        return this;
      }

      /**
       * Interrupt any currently playing animations
       * @param {boolean} immediate 
       */
      immediate(immediate: boolean): this {
        this._immediate = immediate;
        return this;
      }


      /** Handles executing the sequence */
      async run() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!(this as any)._playIf) return;

        if (!this._target) throw new InvalidSpriteError(this._target);
        const mesh = this._target?.getMesh();
        if (!mesh) throw new InvalidSpriteError(this._target);


        const animations = this._animations.map(anim => coerceAnimation(anim, this._target)) as AnimationConfig[];
        if (animations.some(anim => !anim)) throw new InvalidAnimationError(animations.find(anim => !anim));

        if (this._loop) animations[animations.length - 1].loop = true;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        let playFunc: Function | undefined = undefined;


        if (this._immediate) playFunc = this._target.playAnimations.bind(this._target);
        else playFunc = this._target.queueAnimations.bind(this._target);

        // if (this._remote && this._immediate) playFunc = this._target.playAnimations.bind(this._target);
        // else if (this._remote && !this._immediate) playFunc = this._target.queueAnimations.bind(this._target);
        // else if (!this._remote && this._immediate) playFunc = this._target.playAnimations.bind()

        // if (this._remote && this._immediate) playFunc = playAnimations.bind(undefined, this._target.mesh, animations);
        // else if (this._remote && !this._immediate) playFunc = queueAnimations.bind(undefined, this._target.mesh, animations);
        // else if (!this._remote && this._immediate) playFunc = SpriteAnimator.playAnimations.bind(undefined, this._target, ...animations);
        // else if (!this._remote && !this._immediate) playFunc = SpriteAnimator.queueAnimations.bind(undefined, this._target, ...animations);

        if (!playFunc) return;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        if ((this as any)._waitUntilFinished) await playFunc();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        else void playFunc();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        await new Promise(resolve => { setTimeout(resolve, (this as any)._currentWaitTime) });
      }

      async _serialize() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const data = await super._serialize();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const actualData = {
          ...data,
          type: "spriteAnimation",
          sectionData: {
            target: this._target?.getDocument()?.uuid,
            animations: this._animations,
            loop: this._loop,
            immediate: this._immediate
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return actualData;
      }

      // eslint-disable-next-line @typescript-eslint/require-await
      async _deserialize(data: Record<string, unknown>) {
        this._remote = true;
        const sectionData = (data.sectionData as Record<string, unknown>) ?? {}

        if (typeof sectionData.target === "string") this.setTarget(sectionData.target);
        if (typeof sectionData.loop === "boolean") this._loop = sectionData.loop;
        if (typeof sectionData.immediate === "boolean") this._immediate = sectionData.immediate;

        if (Array.isArray(sectionData.animations))
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          this._animations.splice(0, this._animations.length, ...sectionData.animations);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return super._deserialize(data);
      }

      constructor(sequence: Sequence, target?: Animatable) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        super(sequence);
        if (target) this.on(target);
      }
    }


    sectionManagerClass = SpriteAnimationManager;
    return sectionManagerClass;
  }

}