import { DefoHTMLElement, Views } from "./types";
import renderTree, { renderNode } from "./render";
import {
  attributeNameMatchesPrefix,
  attributeNameToViewName,
  hasDatasetKeysMatchingPrefix
} from "./helpers";

export default function observe({
  prefix,
  scope,
  views
}: {
  prefix: string;
  scope: HTMLElement;
  views: Views;
}): MutationObserver {
  renderTree({ prefix, scope, views });
  const observer = new window.MutationObserver(mutations => {
    mutations.forEach(mutation => {
      const target = mutation.target as DefoHTMLElement;
      if (
        mutation.type === "attributes" &&
        attributeNameMatchesPrefix(mutation.attributeName, prefix)
      ) {
        const viewName = attributeNameToViewName(mutation.attributeName);
        // If the attribute is no longer present, we should destroy the (single)
        // called view
        if (!target.hasAttribute(mutation.attributeName)) {
          target._defoDestroy[viewName]();
        } else if (mutation.oldValue !== null) {
          // If there’s an oldValue, we should update
          target._defoUpdate[viewName](
            target.getAttribute(mutation.attributeName),
            mutation.oldValue
          );
        } else {
          // Attribute is new (but element isn’t)
          renderNode(target, prefix, views, viewName);
        }

        // TODO also need to handle cases where a node hasn't been removed, but
        // its *view attributes* might have been (i.e., destroying that view)
      } else if (mutation.type === "childList") {
        // Can either do what viewloader does and render on everything in scope
        // or we could drill down on addedNodes here
        // Need to destroy all removedNodes
        Array.prototype.slice
          .call(mutation.removedNodes)
          .filter(
            (node: DefoHTMLElement): Boolean => {
              return node.nodeType !== node.TEXT_NODE;
            }
          )
          .filter(
            (node: DefoHTMLElement): Boolean =>
              hasDatasetKeysMatchingPrefix(node, prefix)
          )
          .forEach((node: DefoHTMLElement): void => {
            // Call each destroy method attached to the node
            Object.keys(node._defoDestroy).forEach(key => {
              node._defoDestroy[key]();
            });
          });

        // Call render on any added nodes (only the root added nodes are in the
        // NodeList so we need to traverse)
        Array.prototype.slice
          .call(mutation.addedNodes)
          .filter(
            (node: DefoHTMLElement): Boolean => {
              return node.nodeType !== node.TEXT_NODE;
            }
          )
          .forEach((node: DefoHTMLElement): void => {
            // Wrap and then unwrap the added node to ensure the call order
            // is correct (the `destroy` methods are resolved as promises and
            // so we need to ensure initial calls are too).
            Promise.resolve(node).then((resolvedNode: DefoHTMLElement) => {
              renderTree({ prefix, scope: resolvedNode, views });
            });
          });
      }
    });
  });

  observer.observe(scope, {
    attributes: true,
    attributeOldValue: true,
    childList: true,
    characterData: false,
    subtree: true
  });

  return observer;
}
