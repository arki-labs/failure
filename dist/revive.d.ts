/** Validated failure transport. Versionless stored envelopes remain readable. */
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { Failure } from './failure.js';
/** Boundary failures, reusable by transports that expose revival to their caller. */
export declare const REVIVAL_FAILURES: readonly [import("./failure.js").FailureDefinition<"failure.invalid_envelope", StandardSchemaV1<unknown, {
    reason: (typeof import("./foundations.js").INVALID_ENVELOPE_REASONS)[number];
}>>, import("./failure.js").FailureDefinition<"schema.async_required", undefined>, import("./failure.js").FailureDefinition<"schema.validator_defect", undefined>, import("./failure.js").FailureDefinition<"failure.unexpected_defect", undefined>];
export type RevivalFailure = ReturnType<(typeof REVIVAL_FAILURES)[number]>;
/** Definitions, rather than a handwritten union, are the wire allowlist. */
type Revivable = {
    readonly code: string;
    readonly dataSchema: StandardSchemaV1 | undefined;
    (...args: never[]): Failure;
};
type LooseRevivable = {
    readonly code: string;
    readonly dataSchema: StandardSchemaV1 | undefined;
    (...args: unknown[]): Failure;
};
/**
 * Rebuild a known failure using local metadata. Unknown codes and malformed
 * envelopes return InvalidEnvelope; unrelated values return undefined.
 * Accepts legacy `{code, data}` and version 1 envelopes. JSON data must validate
 * without changing: non-JSON data and transforms need a separate wire definition.
 */
export declare function revive<const Definitions extends readonly Revivable[]>(value: unknown, definitions: Definitions): ReturnType<Definitions[number]> | RevivalFailure | undefined;
export declare function revive<const Definitions extends readonly Revivable[], Invalid>(value: unknown, definitions: Definitions, options: {
    readonly onInvalid: (failure: RevivalFailure) => Invalid;
}): ReturnType<Definitions[number]> | Invalid | undefined;
/** Parse JSON and revive it under the same allowlist and protocol rules. */
export declare function reviveJson<const Definitions extends readonly Revivable[]>(text: string, definitions: Definitions): ReturnType<Definitions[number]> | RevivalFailure | undefined;
/**
 * Produce a version 1 JSON-safe envelope, omitting private causes and remote
 * presentation metadata. A definition omitted from the allowlist is a type error.
 */
export declare function serialize<const Definitions extends readonly Revivable[]>(failure: NoInfer<ReturnType<Definitions[number]>>, definitions: Definitions): ReturnType<typeof serializeNow>;
declare function serializeNow(failure: Failure, definitions: readonly LooseRevivable[]): Failure<"failure.invalid_envelope", {
    reason: (typeof import("./foundations.js").INVALID_ENVELOPE_REASONS)[number];
}> | Failure<"schema.async_required", undefined> | Failure<"schema.validator_defect", undefined> | {
    version: 1;
    code: string;
    data?: undefined;
} | {
    version: 1;
    code: string;
    data: unknown;
};
/** The output-only schema a JSON wire boundary uses; validation cannot transform twice. */
export declare function wireSchema<Schema extends StandardSchemaV1>(schema: Schema): StandardSchemaV1<StandardSchemaV1.InferOutput<Schema>, StandardSchemaV1.InferOutput<Schema>>;
export {};
//# sourceMappingURL=revive.d.ts.map