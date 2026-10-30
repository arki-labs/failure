/**
 * A lossless JSON representation, with sorted object keys for comparison.
 * Unlike JSON.stringify, this rejects values JSON silently drops or transforms.
 * Descriptors keep getters and toJSON hooks from executing at a wire boundary.
 */
export declare function jsonText(value: unknown, seen?: Set<object>, depth?: number): string | undefined;
//# sourceMappingURL=json.d.ts.map