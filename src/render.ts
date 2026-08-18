import {
  DefoHTMLElement,
  DestroyFn,
  UpdateRawAttributeFn,
  ViewFnReturnValue,
  Views,
} from "./types";
import { dasherize, keyForDataset, parseProps } from "./helpers";
import { createEventHelpers } from "./events";

// Render over a set of DOM Node and its children. Initialising any components
// in the scope unless they’ve already been called.

// Views should look like this:
/*

function viewName(el, props) {
  return {
    update: (newProps, prevProps) => { ... }
    destroy: (props) => { ... }
  }
}

*/

export default function renderTree({
  prefix,
  scope,
  views,
}: {
  prefix: string;
  views: Views;
  scope: HTMLElement;
}) {
  Object.keys(views).forEach((viewName) => {
    const attrName = `data-${prefix}-${dasherize(viewName)}`;
    let nodes = Array.prototype.slice.call(
      scope.querySelectorAll(`[${attrName}]`)
    );
    // Include the scope if it matches
    if (scope.hasAttribute(attrName)) {
      nodes = [scope].concat(nodes);
    }
    nodes.forEach((node: DefoHTMLElement) => {
      renderViewForNode(node, prefix, views, viewName);
    });
  });
}

export function renderViewForNode(
  node: DefoHTMLElement,
  prefix: string,
  views: Views,
  viewName: string
): void {
  // Bail if this specific view function has already been called for this node
  if (node._defoUpdate && node._defoUpdate[viewName]) {
    return;
  }
  const viewFunction = views[viewName];
  const datasetkey = keyForDataset(prefix, viewName);
  if (!viewFunction || !(datasetkey in node.dataset)) {
    return;
  }
  // Call the defined view function, passing it a set of helpers for binding
  // events that are automatically unbound when the view is destroyed.
  const dataValue = node.dataset[datasetkey];
  const events = createEventHelpers(node);
  const returnValue = viewFunction(
    node,
    dataValue ? parseProps(dataValue) : undefined,
    { on: events.on, signal: events.signal }
  );
  // Set any update/destroy methods from the returned value of the view
  // call directly on the node.
  node._defoUpdate = node._defoUpdate || {};
  node._defoDestroy = node._defoDestroy || {};
  node._defoUpdate[viewName] = unwrapUpdate(returnValue);
  node._defoDestroy[viewName] = unwrapDestroy(
    returnValue,
    node,
    viewName,
    events.destroy
  );
}

function unwrapUpdate(
  returnValue: ViewFnReturnValue | Promise<ViewFnReturnValue>
): UpdateRawAttributeFn {
  return function (newProps, prevProps) {
    const resolvedNewProps = newProps ? parseProps(newProps) : newProps;
    const resolvedPrevProps = prevProps ? parseProps(prevProps) : prevProps;
    Promise.resolve(returnValue).then((resolvedReturnValue) => {
      if (resolvedReturnValue && resolvedReturnValue.update) {
        resolvedReturnValue.update(resolvedNewProps, resolvedPrevProps);
      }
    });
  };
}

function unwrapDestroy(
  returnValue: ViewFnReturnValue | Promise<ViewFnReturnValue>,
  node: DefoHTMLElement,
  viewName: string,
  destroyEvents: DestroyFn
): DestroyFn {
  return function () {
    Promise.resolve(returnValue).then((resolvedReturnValue) => {
      // Always unbind any listeners registered via `on`/`signal`, and clean
      // up the node’s bookkeeping, regardless of whether the view itself
      // returned a `destroy` method.
      destroyEvents();
      resolvedReturnValue?.destroy?.();
      if (node._defoUpdate) {
        delete node._defoUpdate[viewName];
      }
      if (node._defoDestroy) {
        delete node._defoDestroy[viewName];
      }
    });
  };
}
