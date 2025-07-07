import { AnimationConfig } from "interfaces";

export interface AnimationConfigRenderContext extends foundry.applications.api.ApplicationV2.RenderContext {
  animations: (AnimationConfig & { isVideo: boolean })[];
  buttons: foundry.applications.api.ApplicationV2.FormFooterButton[];
}