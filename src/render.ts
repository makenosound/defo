import { DefoHTMLElement, Views } from "./types";

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
  views
}: {
  prefix: string;
  views: Views;
  scope: HTMLElement;
}) {
  Object.keys(views).forEach(viewName => {
    const attrName = `data-${prefix}-${dasherize(viewName)}`;
    let nodes = Array.prototype.slice.call(
      scope.querySelectorAll(`[${attrName}]`)
    );
    // Include the scope if it matches
    if (scope.hasAttribute(attrName)) {
      nodes = [scope].concat(nodes);
    }
    nodes.forEach((node: DefoHTMLElement) => {
      renderNode(node, prefix, views, viewName);
    });
  });
}

// TODO generate hash from views object and use to namespace? Would only be
// useful for when individual view methods are updated (will that ever happen?)
export  function renderNode(
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
  if (!viewFunction) {
    return;
  }
  // Call the defined view function
  const returnValue = viewFunction(
    node,
    parseProps(node.dataset[keyForDataset(prefix, viewName)])
  );
  // Set any update/destroy methods from the returned value of the view
  // call directly on the node.
  node._defoUpdate = node._defoUpdate || {};
  node._defoDestroy = node._defoDestroy || {};
  node._defoUpdate[viewName] = unwrapUpdate(returnValue);
  node._defoDestroy[viewName] = unwrapDestroy(returnValue, node, viewName);
}

interface ViewReturnValue {
  update?: Function;
  destroy?: Function;
}

function unwrapUpdate(
  returnValue: ViewReturnValue | Promise<ViewReturnValue>
): Function {
  return function(newProps: any, prevProps: any) {
    newProps = newProps ? parseProps(newProps) : newProps;
    prevProps = prevProps ? parseProps(prevProps) : prevProps;
    Promise.resolve(returnValue).then(resolvedReturnValue => {
      if (resolvedReturnValue.update) {
        resolvedReturnValue.update(newProps, prevProps);
      }
    });
  };
}

function unwrapDestroy(
  returnValue: ViewReturnValue | Promise<ViewReturnValue>,
  node: DefoHTMLElement,
  viewName: string,
): Function {
  return function() {
    Promise.resolve(returnValue).then(resolvedReturnValue => {
      if (resolvedReturnValue.destroy) {
        resolvedReturnValue.destroy();
        delete node._defoUpdate[viewName];
        delete node._defoDestroy[viewName];
      }
    });
  };
}

function keyForDataset(prefix: string, viewName: string): string {
  return `${prefix}${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`;
}

/**
 * dasherize
 *
 * Replace a camelCased string to dashed-case
 */
function dasherize(str: string): string {
  const pattern = /([a-z0-9])([A-Z])/g;
  return str.replace(pattern, "$1-$2").toLowerCase();
}

/**
 * parseProps
 *
 * Return the value of the data-prefix attribute. Parsing it as JSON if it looks
 * like it is JSON content.
 */
export function parseProps(value: string): string {
  const pattern = /^({|\[)/;
  if (pattern.test(value)) {
    value = JSON.parse(value);
  }
  return value;
}

/**
 * No-operation
 */
function noop(): void {}
