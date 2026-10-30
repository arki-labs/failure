import { AsyncSchema, InvalidInput, readIssues, ValidatorDefect } from './foundations.js';
const ignore = () => {
    // A synchronous caller cannot consume an asynchronous result.
};
function isThenable(result) {
    return typeof result === 'object' && result !== null && 'then' in result && typeof result.then === 'function';
}
/** Observe a native promise even when its own then accessor is hostile. */
function observePending(value) {
    try {
        void Promise.prototype.then.call(value, ignore, ignore);
    }
    catch {
        // The intrinsic rejects non-promise receivers; there is no native rejection to observe.
    }
}
function malformedResult() {
    return ValidatorDefect({ cause: new TypeError('The validator returned a malformed Standard Schema result.') });
}
/** Result inspection stays inside the protected execution path, including every getter. */
function complete(result) {
    if (typeof result !== 'object' || result === null)
        return malformedResult();
    const issues = result.issues;
    if (issues === undefined) {
        if (!('value' in result))
            return malformedResult();
        return { value: result.value };
    }
    const publicIssues = readIssues(issues);
    if (publicIssues === undefined)
        return malformedResult();
    return InvalidInput({ issues: publicIssues });
}
/**
 * Run a schema once without unwrapping: `{ value }` on success, or an invalid-input,
 * async-schema or validator-defect failure. Use it when the value itself may be a failure,
 * which `parse` would confuse with a rejection.
 */
export function executeSchema(schema, value) {
    let pending;
    try {
        const standard = schema['~standard'];
        if (standard.version !== 1 || typeof standard.vendor !== 'string')
            return malformedResult();
        const result = standard.validate(value);
        pending = result;
        if (isThenable(result)) {
            // Sync callers drop this result. Observe its rejection before returning the mismatch.
            void Promise.resolve(result).then(ignore, ignore);
            return AsyncSchema();
        }
        return complete(result);
    }
    catch (error) {
        observePending(pending);
        return ValidatorDefect({ cause: error });
    }
}
/** @internal The asynchronous counterpart used by revival without output collisions. */
export async function executeSchemaAsync(schema, value) {
    let pending;
    try {
        const standard = schema['~standard'];
        if (standard.version !== 1 || typeof standard.vendor !== 'string')
            return malformedResult();
        const result = standard.validate(value);
        pending = result;
        return complete(await result);
    }
    catch (error) {
        observePending(pending);
        return ValidatorDefect({ cause: error });
    }
}
//# sourceMappingURL=schema-executor.js.map