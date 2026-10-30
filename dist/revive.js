import { isFailure, orThrow } from './failure.js';
import { AsyncSchema, InvalidEnvelope, InvalidInput, UnexpectedDefect, ValidatorDefect } from './foundations.js';
import { jsonText } from './json.js';
import { executeSchema } from './schema-executor.js';
/** Boundary failures, reusable by transports that expose revival to their caller. */
export const REVIVAL_FAILURES = [InvalidEnvelope, AsyncSchema, ValidatorDefect, UnexpectedDefect];
export function revive(value, definitions, options) {
    const result = readEnvelope(value, definitions);
    if (result === undefined)
        return;
    if (isFailure(result))
        return options === undefined ? result : options.onInvalid(result);
    return result.failure;
}
/** Preserve provenance: a declared canonical failure is still a valid decoded value. */
function readEnvelope(value, definitions) {
    try {
        if (typeof value !== 'object' || value === null)
            return;
        if (!('code' in value)) {
            return 'version' in value ? InvalidEnvelope({ reason: 'malformed' }) : undefined;
        }
        // Reading descriptors rejects hostile accessors instead of invoking them.
        const fields = Object.getOwnPropertyDescriptors(value);
        const code = fields.code?.value;
        if (fields.code === undefined || !('value' in fields.code) || typeof code !== 'string') {
            return InvalidEnvelope({ reason: 'malformed' });
        }
        if ('version' in value) {
            const version = fields.version?.value;
            if (fields.version === undefined || !('value' in fields.version)) {
                return InvalidEnvelope({ reason: 'malformed' });
            }
            if (version !== 1)
                return InvalidEnvelope({ reason: 'unsupported_version' });
        }
        const definition = definitions.find(candidate => candidate.code === code);
        if (definition === undefined)
            return InvalidEnvelope({ reason: 'unknown_code' });
        if ('data' in value && (fields.data === undefined || !('value' in fields.data))) {
            return InvalidEnvelope({ reason: 'malformed' });
        }
        const data = fields.data?.value;
        const validated = validateData(definition, data);
        if (isFailure(validated))
            return validated;
        try {
            return { failure: definition.dataSchema === undefined ? definition() : definition(validated.value) };
        }
        catch (error) {
            return UnexpectedDefect({ cause: error });
        }
    }
    catch (error) {
        return InvalidEnvelope({ reason: 'malformed' }, { cause: error });
    }
}
/** Parse JSON and revive it under the same allowlist and protocol rules. */
export function reviveJson(text, definitions) {
    let value;
    try {
        value = JSON.parse(text);
    }
    catch (error) {
        return InvalidEnvelope({ reason: 'invalid_json' }, { cause: error });
    }
    return revive(value, definitions);
}
export function serialize(failure, definitions) {
    return serializeNow(failure, definitions);
}
function serializeNow(failure, definitions) {
    try {
        const definition = definitions.find(candidate => candidate.code === failure.code);
        if (definition === undefined)
            return InvalidEnvelope({ reason: 'unknown_code' });
        const validated = validateData(definition, failure.data);
        if (isFailure(validated))
            return validated;
        if (validated.value === undefined)
            return { version: 1, code: definition.code };
        // Copy verified JSON data so later mutation of the original cannot add secrets.
        const text = validated.text;
        if (text === undefined)
            return InvalidEnvelope({ reason: 'non_json_data' });
        const data = JSON.parse(text);
        return { version: 1, code: definition.code, data };
    }
    catch (error) {
        return InvalidEnvelope({ reason: 'malformed' }, { cause: error });
    }
}
/** A wrapper prevents failure-valued schema output colliding with a parser failure. */
function validateData(definition, data) {
    if (definition.dataSchema === undefined) {
        return data === undefined ? { value: undefined, text: undefined } : InvalidEnvelope({ reason: 'invalid_data' });
    }
    const input = data === undefined ? undefined : jsonText(data);
    if (data !== undefined && input === undefined)
        return InvalidEnvelope({ reason: 'non_json_data' });
    // Validate a detached snapshot: a proxy or concurrent mutation cannot change
    // the input after its JSON-safety check.
    const snapshot = input === undefined ? undefined : JSON.parse(input);
    const result = executeSchema(definition.dataSchema, snapshot);
    if (InvalidInput.is(result))
        return InvalidEnvelope({ reason: 'invalid_data' }, { cause: result });
    if (isFailure(result))
        return result;
    const output = result.value === undefined ? undefined : jsonText(result.value);
    if (result.value !== undefined && output === undefined)
        return InvalidEnvelope({ reason: 'non_json_data' });
    if (input !== output)
        return InvalidEnvelope({ reason: 'unstable_schema' });
    const value = output === undefined ? undefined : JSON.parse(output);
    return { value, text: output };
}
export function wireSchema(schema) {
    return {
        '~standard': {
            version: 1,
            vendor: 'arki/failure',
            validate(value) {
                const result = validateData({ dataSchema: schema }, value);
                if (InvalidEnvelope.is(result))
                    return { issues: [{ message: result.message }] };
                // Standard Schema is an explicit foreign exception boundary for validator defects.
                const validated = orThrow(result);
                return { value: validated.value };
            },
        },
    };
}
//# sourceMappingURL=revive.js.map