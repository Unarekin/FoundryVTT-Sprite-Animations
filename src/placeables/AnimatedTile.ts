import { AnimationFlags } from "interfaces";
import { DeepPartial } from "types";
import { AnimatedPlaceableMixin } from "./AnimatedPlaceable";
import { HandleEmptyObject } from "fvtt-types/utils";

type TileConstructor = new (...args: any[]) => foundry.canvas.placeables.Tile;

export function AnimatedTileMixin(base: TileConstructor) {
  class AnimatedTile extends AnimatedPlaceableMixin<TileConstructor>(base) {
    public getMesh() { return this.mesh; }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    protected getAnimationFlags(): DeepPartial<AnimationFlags> | undefined { return (this.document?.flags as any)[__MODULE_ID__] as DeepPartial<AnimationFlags>; }


    // These are implemented here entirely so that the linter doesn't complain because our direct parent is abstract
    get bounds() { return super.bounds; }
    protected _draw(options: HandleEmptyObject<foundry.canvas.placeables.PlaceableObject.DrawOptions>): Promise<void> { return super._draw(options) }
  }

  return AnimatedTile;
}
