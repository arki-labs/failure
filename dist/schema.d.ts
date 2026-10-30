/** Minimal Standard Schema execution shared by schema parsing and failure revival. */
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { FailureOf } from './failure.js';
export { executeSchema } from './schema-executor.js';
/** Validation definitions for boundaries that expose schema parsing to their callers. */
export declare const SCHEMA_FAILURES: readonly [import("./failure.js").FailureDefinition<"schema.invalid_input", StandardSchemaV1<unknown, {
    issues: readonly StandardSchemaV1.Issue[];
}>>, import("./failure.js").FailureDefinition<"schema.async_required", undefined>, import("./failure.js").FailureDefinition<"schema.validator_defect", undefined>];
/** The schema's output, or an invalid-input, async-schema or validator-defect failure. */
export declare function parse<Output>(schema: StandardSchemaV1<unknown, Output>, value: unknown): Output | import("./failure.js").Failure<"schema.async_required", undefined> | import("./failure.js").Failure<"schema.invalid_input", {
    issues: readonly StandardSchemaV1.Issue[];
}> | import("./failure.js").Failure<"schema.validator_defect", undefined>;
/** The schema's output, or an invalid-input or validator-defect failure. */
export declare function parseAsync<Output>(schema: StandardSchemaV1<unknown, Output>, value: unknown): Promise<Output | import("./failure.js").Failure<"schema.invalid_input", {
    issues: readonly StandardSchemaV1.Issue[];
}> | import("./failure.js").Failure<"schema.validator_defect", undefined>>;
/** The exact failures a synchronous schema parse can return. */
export type SchemaFailure = FailureOf<typeof parse<never>>;
/** The exact failures an asynchronous schema parse can return. */
export type AsyncSchemaFailure = FailureOf<typeof parseAsync<never>>;
/** True only for the canonical failures returned by synchronous schema parsing. */
export declare function isSchemaFailure(value: unknown): value is SchemaFailure;
/** True only for the canonical failures returned by asynchronous schema parsing. */
export declare function isAsyncSchemaFailure(value: unknown): value is AsyncSchemaFailure;
//# sourceMappingURL=schema.d.ts.map