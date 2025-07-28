import { AnimationConfig, MeshAdjustmentConfig } from "interfaces";

export type AnimationContext = (AnimationConfig & { isVideo: boolean });

export interface AnimationConfigRenderContext extends foundry.applications.api.ApplicationV2.RenderContext {
  animations: (AnimationConfig & { isVideo: boolean })[];
  buttons: foundry.applications.api.ApplicationV2.FormFooterButton[];

  meshAdjustments: MeshAdjustmentConfig;

  tab?: foundry.applications.api.ApplicationV2.Tab;
}

export type AnimationConfigConfiguration = foundry.applications.api.ApplicationV2.Configuration;
export type AnimationConfigRenderOptions = foundry.applications.api.ApplicationV2.RenderOptions;

export interface AnimationPlayerRenderContext extends foundry.applications.api.ApplicationV2.RenderContext {
  animations: (AnimationConfig & { isVideo: boolean })[];
  buttons: foundry.applications.api.ApplicationV2.FormFooterButton[];
}

export type AnimationPlayerConfiguration = foundry.applications.api.ApplicationV2.Configuration;
export type AnimationPlayerRenderOptions = foundry.applications.api.ApplicationV2.RenderOptions