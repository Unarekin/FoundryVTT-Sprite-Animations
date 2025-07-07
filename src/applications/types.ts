import { AnimationConfig } from "interfaces";

export type AnimationContext = (AnimationConfig & { isVideo: boolean });

export interface AnimationConfigRenderContext extends foundry.applications.api.ApplicationV2.RenderContext {
  animations: (AnimationConfig & { isVideo: boolean })[];
  buttons: foundry.applications.api.ApplicationV2.FormFooterButton[];
}


export interface AnimationPlayerRenderContext extends foundry.applications.api.ApplicationV2.RenderContext {
  animations: (AnimationConfig & { isVideo: boolean })[];
  buttons: foundry.applications.api.ApplicationV2.FormFooterButton[];
}