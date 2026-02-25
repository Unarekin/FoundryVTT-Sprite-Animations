import { AnimationConfig } from "interfaces";
import { generatePreviewTooltip } from "utils";

Handlebars.registerHelper("isEven", function (index) {
  return (index % 2) === 0;
});

Handlebars.registerHelper("isOdd", function (index) {
  return (index % 2) === 1;
});

Handlebars.registerHelper("animationPreviewTooltip", function (animation: AnimationConfig) {
  if (!animation) return "";
  const elem = generatePreviewTooltip(animation);
  return elem.outerHTML;
})