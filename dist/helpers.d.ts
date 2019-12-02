/**
 * Check if a dasherized data-attribute name matches the given prefix
 * I.e., does data-defo-view-name match defo
 * @param attributeName
 * @param prefix
 */
export declare function attributeNameMatchesPrefix(attributeName: string, prefix: string): boolean;
/**
 * Convert a dasherized data-attribute name to a lowerFirst view name
 * @param attributeName
 */
export declare function attributeNameToViewName(attributeName: string): string;
/**
 * Check if a node has `dataset` values matching the given prefix
 * @param node
 * @param prefix
 */
export declare function hasDatasetKeysMatchingPrefix(node: HTMLElement, prefix: string): boolean;
/**
 * Generate a lowerFirst dataset key from a given prefix and view name
 * ("defo", "viewName") => "defoViewName"
 * @param prefix
 * @param viewName
 */
export declare function keyForDataset(prefix: string, viewName: string): string;
/**
 * Convert a lowerFirst string to dashed-separated
 * @param str
 */
export declare function dasherize(str: string): string;
/**
 * Convert a dash-separated string to lowerFirst
 * @param str
 */
export declare function lowerFirsterize(str: string): string;
/**
 * Capitalize the first letter of a given string
 * @param str
 */
export declare function capitalize(str: string): string;
/**
 * parseProps
 *
 * Return the value of the data-prefix attribute. Parsing it as JSON if it looks
 * like it is JSON content.
 */
export declare function parseProps(value: string): string;
