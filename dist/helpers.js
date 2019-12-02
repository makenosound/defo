/**
 * Check if a dasherized data-attribute name matches the given prefix
 * I.e., does data-defo-view-name match defo
 * @param attributeName
 * @param prefix
 */
export function attributeNameMatchesPrefix(attributeName, prefix) {
    return attributeName.indexOf(`data-${prefix}-`) === 0;
}
/**
 * Convert a dasherized data-attribute name to a lowerFirst view name
 * @param attributeName
 */
export function attributeNameToViewName(attributeName) {
    return attributeName
        .split("-")
        .slice(2) // Skip `data-prefix` of `data-prefix-view-name`
        .map((part, index) => {
        return index > 0 ? capitalize(part) : part;
    })
        .join("");
}
/**
 * Return `dataset` keys that begin with the given prefix
 * @param node
 * @param prefix
 */
function datasetKeysForPrefix(node, prefix) {
    // Index will be 0 since we’re matching `${prefix}${ViewName}`
    return Object.keys(node.dataset).filter(key => key.indexOf(prefix) === 0);
}
/**
 * Check if a node has `dataset` values matching the given prefix
 * @param node
 * @param prefix
 */
export function hasDatasetKeysMatchingPrefix(node, prefix) {
    return datasetKeysForPrefix(node, prefix).length > 0;
}
/**
 * Generate a lowerFirst dataset key from a given prefix and view name
 * ("defo", "viewName") => "defoViewName"
 * @param prefix
 * @param viewName
 */
export function keyForDataset(prefix, viewName) {
    return `${lowerFirsterize(prefix)}${capitalize(viewName)}`;
}
/**
 * Convert a lowerFirst string to dashed-separated
 * @param str
 */
export function dasherize(str) {
    const pattern = /([a-z0-9])([A-Z])/g;
    return str.replace(pattern, "$1-$2").toLowerCase();
}
/**
 * Convert a dash-separated string to lowerFirst
 * @param str
 */
export function lowerFirsterize(str) {
    return str
        .replace(/^[_.\- ]+/, "")
        .toLowerCase()
        .replace(/[_.\- ]+(\w|$)/g, (_, p1) => p1.toUpperCase())
        .replace(/\d+(\w|$)/g, m => m.toUpperCase());
}
/**
 * Capitalize the first letter of a given string
 * @param str
 */
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
/**
 * parseProps
 *
 * Return the value of the data-prefix attribute. Parsing it as JSON if it looks
 * like it is JSON content.
 */
export function parseProps(value) {
    try {
        return JSON.parse(value);
    }
    catch (err) {
        // TODO warn in dev
        // console.error(err);
    }
    return value;
}
