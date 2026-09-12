import { stringify as stringifyYaml } from "yaml";

export function stringifyJSON(content: unknown): string {
  return JSON.stringify(content, null, 2);
}

export function stringifyYAML(content: unknown): string {
  return stringifyYaml(content);
}
