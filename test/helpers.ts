import type { DefoHTMLElement } from "../src/types";

/**
 * Simple HTML template function to replace nanohtml
 * Creates DOM elements from template strings
 */
export function html(
  strings: TemplateStringsArray,
  ...values: any[]
): DefoHTMLElement {
  const htmlString = strings.reduce((result, string, i) => {
    return result + string + (values[i] || "");
  }, "");

  const template = document.createElement("template");
  template.innerHTML = htmlString.trim();
  return template.content.firstElementChild as DefoHTMLElement;
}
