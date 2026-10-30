import { isFailure } from './failure.js';
import { AsyncSchema, InvalidInput, ValidatorDefect } from './foundations.js';
import { executeSchema, executeSchemaAsync } from './schema-executor.js';
export { executeSchema } from './schema-executor.js';
/** Validation definitions for boundaries that expose schema parsing to their callers. */
export const SCHEMA_FAILURES = [InvalidInput, AsyncSchema, ValidatorDefect];
/** The schema's output, or an invalid-input, async-schema or validator-defect failure. */
export function parse(schema, value) {
    const result = executeSchema(schema, value);
    return isFailure(result) ? result : result.value;
}
/** The schema's output, or an invalid-input or validator-defect failure. */
export async function parseAsync(schema, value) {
    const result = await executeSchemaAsync(schema, value);
    return isFailure(result) ? result : result.value;
}
/** True only for the canonical failures returned by synchronous schema parsing. */
export function isSchemaFailure(value) {
    return SCHEMA_FAILURES.some(definition => definition.is(value));
}
/** True only for the canonical failures returned by asynchronous schema parsing. */
export function isAsyncSchemaFailure(value) {
    return InvalidInput.is(value) || ValidatorDefect.is(value);
}
//# sourceMappingURL=schema.js.map