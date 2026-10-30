/** Canonical failures shared by validation, revival and operation boundaries. */
import type { StandardSchemaV1 } from '@standard-schema/spec';
type InputData = {
    issues: readonly StandardSchemaV1.Issue[];
};
/** Input failed the schema's checks. Only intentional public issue fields are retained.
 * @fix Correct the reported input issues.
 * @verify bun run test -- src/schema.test.ts
 */
export declare const InvalidInput: import("./failure.js").FailureDefinition<"schema.invalid_input", StandardSchemaV1<unknown, InputData>>;
/** A synchronous operation received an asynchronous validator result.
 * @fix Use parseAsync() and await the result.
 * @verify bun run test -- src/schema.test.ts
 */
export declare const AsyncSchema: import("./failure.js").FailureDefinition<"schema.async_required", undefined>;
/** A validator threw, rejected, or violated the Standard Schema result contract.
 * @fix Fix the validator; inspect the private cause for details.
 * @verify bun run test -- src/schema.test.ts
 */
export declare const ValidatorDefect: import("./failure.js").FailureDefinition<"schema.validator_defect", undefined>;
/** Stable reasons a failure envelope cannot be accepted. */
export declare const INVALID_ENVELOPE_REASONS: readonly ['malformed', 'unknown_code', 'unsupported_version', 'invalid_data', 'non_json_data', 'unstable_schema', 'invalid_json'];
type EnvelopeData = {
    reason: (typeof INVALID_ENVELOPE_REASONS)[number];
};
/** An external envelope cannot be trusted as a known failure.
 * @fix Send a supported failure envelope with validated JSON data.
 * @verify bun run test -- src/revive.test.ts
 */
export declare const InvalidEnvelope: import("./failure.js").FailureDefinition<"failure.invalid_envelope", StandardSchemaV1<unknown, EnvelopeData>>;
/** A caught operation defect, distinct from the UnexpectedFailure exception bridge.
 * @fix Inspect the private cause and fix the operation.
 * @verify bun run test -- src/schema.test.ts
 */
export declare const UnexpectedDefect: import("./failure.js").FailureDefinition<"failure.unexpected_defect", undefined>;
export {};
//# sourceMappingURL=foundations.d.ts.map