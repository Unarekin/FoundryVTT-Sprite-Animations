import { AnimatedPlaceable as AnimatedPlaceableInterface } from "interfaces";
type PlaceableConstructor = new (...args: any[]) => foundry.canvas.placeables.PlaceableObject;
export declare function AnimatedPlaceableMixin<t extends PlaceableConstructor>(base: t): AnimatedPlaceableInterface & t;
export {};
