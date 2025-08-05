import { DefoHTMLElement, Views } from "./types";
import renderTree, { renderViewForNode } from "./render";
import {
  attributeNameMatchesPrefix,
  attributeNameToViewName,
  hasDatasetKeysMatchingPrefix,
} from "./helpers";

export default function observe({
  prefix,
  scope,
  views,
}: {
  prefix: string;
  scope: HTMLElement;
  views: Views;
}): MutationObserver {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const target = mutation.target as DefoHTMLElement;
      if (
        mutation.type === "attributes" &&
        mutation.attributeName !== null &&
        attributeNameMatchesPrefix(mutation.attributeName, prefix)
      ) {
        const viewName = attributeNameToViewName(mutation.attributeName);
        // If the attribute is no longer present, we should destroy the (single)
        // called view
        if (!target.hasAttribute(mutation.attributeName)) {
          target._defoDestroy?.[viewName]?.();
        } else if (mutation.oldValue !== null) {
          // If there's an oldValue, we should update
          const attributeValue = target.getAttribute(mutation.attributeName);
          if (attributeValue !== null) {
            target._defoUpdate?.[viewName]?.(attributeValue, mutation.oldValue);
          }
        } else {
          // Attribute is new (but element isn’t)
          renderViewForNode(target, prefix, views, viewName);
        }
      } else if (mutation.type === "childList") {
        // Destroy any removed nodes
        Array.prototype.slice
          .call(mutation.removedNodes)
          .filter((node: DefoHTMLElement): Boolean => {
            return node.nodeType === node.ELEMENT_NODE;
          })
          .filter(
            (node: DefoHTMLElement): Boolean =>
              hasDatasetKeysMatchingPrefix(node, prefix)
          )
          .forEach((node: DefoHTMLElement): void => {
            // Call each destroy method attached to the node
            if (node._defoDestroy) {
              Object.keys(node._defoDestroy).forEach((key) => {
                node._defoDestroy?.[key]?.();
              });
            }
          });

        // Call render on any added nodes (only the root added nodes are in the
        // NodeList so we need to traverse the tree)
        Array.prototype.slice
          .call(mutation.addedNodes)
          .filter((node: DefoHTMLElement): Boolean => {
            return node.nodeType === node.ELEMENT_NODE;
          })
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
    subtree: true,
  });

  // Render on load
  renderTree({ prefix, scope, views });

  return observer;
}
