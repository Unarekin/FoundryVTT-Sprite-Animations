import { InvalidAnimationError, InvalidSpriteError, LocalizedError } from "errors";
import { Animatable, AnimatedPlaceable, AnimationConfig, AnimationSequence } from "./interfaces";
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
      private _animations: (string | AnimationConfig | AnimationSequence)[] = [];
      private _immediate = false;
      private _loop: boolean | undefined = undefined;
      private _local = false;

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
        // const coerced = animations.map(anim => coerceAnimation(anim, this._target)) as AnimationConfig[];
        const coerced = animations.map(id => {
          if (typeof id === "string") {
            let anim: AnimationConfig | AnimationSequence | undefined = this._target?.getAnimation(id);
            if (anim) return anim;
            anim = this._target?.getAnimationSequence(id);
            if (anim) return anim;
          } else {
            return id;
          }
        })
        if (coerced.some(anim => !anim)) throw new InvalidAnimationError(animations.find(anim => !anim));
        this._animations.push(...coerced as AnimationConfig[]);
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
       * If true, will only play the animation for the current client
       */
      local(local = true): this {
        this._local = local;
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

        if (this._immediate)
          // eslint-disable-next-line @typescript-eslint/unbound-method
          playFunc = this._target.doPlayAnimations;
        else
          // eslint-disable-next-line @typescript-eslint/unbound-method
          playFunc = this._target.doQueueAnimations;

        if (!playFunc) return;


        const local = this._local;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if ((this as any)._waitUntilFinished) await playFunc.call(this._target, animations, local);
        else void playFunc.call(this._target, animations, local);

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
            local: this._local,
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
        if (typeof sectionData.local === "boolean") this._local = sectionData.local;

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