/** Internal Standard Schema execution; public callers use the unwrapped parse API. */
import type { StandardSchemaV1 } from '@standard-schema/spec';
/**
 * Run a schema once without unwrapping: `{ value }` on success, or an invalid-input,
 * async-schema or validator-defect failure. Use it when the value itself may be a failure,
 * which `parse` would confuse with a rejection.
 */
export declare function executeSchema<Output>(schema: StandardSchemaV1<unknown, Output>, value: unknown): import("./failure.js").Failure<"schema.async_required", undefined> | import("./failure.js").Failure<"schema.invalid_input", {
    issues: readonly StandardSchemaV1.Issue[];
}> | import("./failure.js").Failure<"schema.validator_defect", undefined> | {
    value: Output;
};
//# sourceMappingURL=schema-executor.d.ts.map