import { NPMClient } from "../npm_client";
import { runJavascriptTemplate } from "./javascript";
import { runTypescriptTemplate } from "./typescript";

export interface ITemplateResult {
  entryPoint: string;
  buildSteps: string[];
}

export type TemplateFunction = (
  projectDir: string,
  npmClient: NPMClient,
) => Promise<ITemplateResult>;

export enum TemplateType {
  Javascript = "javascript",
  Typescript = "typescript",
}

const templateMap: Record<TemplateType, TemplateFunction> = {
  [TemplateType.Javascript]: runJavascriptTemplate,
  [TemplateType.Typescript]: runTypescriptTemplate,
};

/**
 * Runs a template in the given folder
 */
export function runTemplate(
  template: TemplateType,
  projectDir: string,
  npmClient: NPMClient,
): Promise<ITemplateResult> {
  return templateMap[template](projectDir, npmClient);
}
