import { AnimationConfig, MeshAdjustmentConfig } from "interfaces";

export interface RenderContext<t extends foundry.abstract.Document.Any = foundry.abstract.Document.Any> extends foundry.applications.api.DocumentSheetV2.RenderContext<t> {
  animations: {
    idPrefix: string;
    animations: AnimationConfig[];
    meshAdjustments: MeshAdjustmentConfig;
    adjustPosTooltip: string;
    adjustSizeTooltip: string;
    tabs: foundry.applications.api.ApplicationV2.Tab[];
  }
  tab?: foundry.applications.api.ApplicationV2.Tab;
}

export type RenderOptions = foundry.applications.api.DocumentSheetV2.RenderOptions

export type Configuration<t extends foundry.abstract.Document.Any = foundry.abstract.Document.Any> = foundry.applications.api.DocumentSheetV2.Configuration<t>

export type TokenRenderContext = RenderContext<foundry.documents.TokenDocument>;
export type TokenRenderOptions = RenderOptions;
export type TokenConfiguration = Configuration<foundry.documents.TokenDocument>;

export type TileRenderContext = RenderContext<foundry.documents.TileDocument>;
export type TileRenderOptions = RenderOptions;
export type TileConfiguration = Configuration<foundry.documents.TileDocument>;

export interface PlayerRenderContext extends foundry.applications.api.ApplicationV2.RenderContext {
  animations: AnimationConfig[];
  queue: AnimationConfig[];
  idPrefix: string;
  buttons: foundry.applications.api.ApplicationV2.FormFooterButton[];
}


export type PlayerRenderOptions = foundry.applications.api.ApplicationV2.RenderOptions;
export type PlayerConfiguration = foundry.applications.api.ApplicationV2.Configuration;

export interface AnimationConfigRenderContext extends foundry.applications.api.ApplicationV2.RenderContext {
  idPrefix: string;
  animation: AnimationConfig;
  buttons: foundry.applications.api.ApplicationV2.FormFooterButton[];
}

export type AnimationConfigRenderOptions = foundry.applications.api.ApplicationV2.RenderOptions;

export interface AnimationConfigConfiguration extends foundry.applications.api.ApplicationV2.Configuration {
  animation: AnimationConfig;
}
export interface AutoFitDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
  anchor: {
    x: number;
    y: number;
  }
}