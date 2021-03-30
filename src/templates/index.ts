export interface ITemplateResult {
  entryPoint: string;
  buildSteps: string[];
}

export type TemplateFunction = (projectDir: string) => Promise<ITemplateResult>;

export enum TemplateType {
  Javascript = "javascript",
  Typescript = "typescript",
}

import { runJavascriptTemplate } from "./javascript";
import { runTypescriptTemplate } from "./typescript";

const templateMap: Record<TemplateType, TemplateFunction> = {
  [TemplateType.Javascript]: runJavascriptTemplate,
  [TemplateType.Typescript]: runTypescriptTemplate,
};

export function runTemplate(
  template: TemplateType,
  projectDir: string,
): Promise<ITemplateResult> {
  return templateMap[template](projectDir);
}
