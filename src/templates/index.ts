export type TemplateFunction = (
  projectDir: string,
) => Promise<{ entryPoint: string; buildSteps: string[] }>;

export enum TemplateType {
  Javascript = "javascript",
  Typescript = "typescript",
}

import { runJavascriptTemplate } from "./javascript";
import { runTypescriptTemplate } from "./typescript";

export const templateMap: Record<TemplateType, TemplateFunction> = {
  [TemplateType.Javascript]: runJavascriptTemplate,
  [TemplateType.Typescript]: runTypescriptTemplate,
};
