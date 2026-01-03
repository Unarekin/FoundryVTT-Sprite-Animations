import { AnimationFlags } from "interfaces";
import { DeepPartial } from "types";
import { AnimatedPlaceableMixin } from "./AnimatedPlaceable";
import { HandleEmptyObject } from "fvtt-types/utils";

type TokenConstructor = new (...args: any[]) => foundry.canvas.placeables.Token;

export function AnimatedTokenMixin(base: TokenConstructor) {

  class AnimatedToken extends AnimatedPlaceableMixin<TokenConstructor>(base) {

    public getMesh() { return this.mesh; }

    protected getAnimationFlags(): DeepPartial<AnimationFlags> | undefined {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return (this.actor as any)?.flags[__MODULE_ID__];
    }


    // These are implemented here entirely so that the linter doesn't complain because our direct parent is abstract
    get bounds() { return super.bounds; }
    protected _draw(options: HandleEmptyObject<foundry.canvas.placeables.PlaceableObject.DrawOptions>): Promise<void> { return super._draw(options) }

  }

  return AnimatedToken;
}
