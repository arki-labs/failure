import { FAILURE_ERROR_CODES, FailureError } from './errors.js';
/**
 * The brand every failure carries. A string key, like Standard Schema's
 * `~standard`: it survives duplicated package copies and realms, sorts last in
 * autocomplete, and lets the `must-use` lint rule see failures in a type.
 * At runtime it is non-enumerable, so JSON and spreads never show it.
 */
const BRAND = '~failure';
export function defineFailure(code, options = {}) {
    if (code === '' || code === 'ok') {
        throw new FailureError(FAILURE_ERROR_CODES.invalidCode, `defineFailure() needs a non-empty code other than "ok", got ${JSON.stringify(code)}`, 'Use a stable dotted code such as "post.not_found"; "ok" is reserved for the success branch of match().');
    }
    const status = options.status ?? 400;
    if (!Number.isInteger(status) || status < 400 || status > 599) {
        throw new FailureError(FAILURE_ERROR_CODES.invalidStatus, `defineFailure("${code}") needs a status from 400 to 599, got ${String(status)}`, 'Pick the HTTP status a client should see: 4xx when the caller can fix it, 5xx when it cannot.');
    }
    const { message, remediation, data: dataSchema } = options;
    const hasData = dataSchema !== undefined;
    const make = (...args) => {
        const data = hasData ? args[0] : undefined;
        const text = typeof message === 'function' ? message(data) : fill(message ?? code, data);
        return new FailureValue(code, text, data, status, remediation, causeOf(hasData ? args[1] : args[0]));
    };
    const is = (value) => {
        try {
            return isFailure(value) && value.code === code;
        }
        catch {
            return false;
        }
    };
    return Object.freeze(Object.assign(make, { code, status, remediation, dataSchema, is }));
}
/**
 * The runtime shape of every failure. Own fields are the JSON a failure
 * serialises to; the brand and `cause` are prototype getters, so JSON, spreads
 * and `Object.keys` never show them, while `'~failure' in value` still sees the brand.
 */
class FailureValue {
    code;
    message;
    data;
    status;
    remediation;
    #cause;
    constructor(code, message, data, status, remediation, cause) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.status = status;
        this.remediation = remediation;
        this.#cause = cause;
        // eslint-disable-next-line failure/must-use -- Object.freeze returns this same instance; construction returns it to the caller.
        Object.freeze(this);
    }
    get cause() {
        return this.#cause;
    }
}
// eslint-disable-next-line failure/must-use -- Native prototype mutation returns its target, not a newly produced failure.
Object.defineProperty(FailureValue.prototype, BRAND, { value: true });
/** The `cause` of a definition call's options argument, if it has one. */
function causeOf(options) {
    return typeof options === 'object' && options !== null && 'cause' in options ? options.cause : undefined;
}
/** Fill `{key}` placeholders from the data; a placeholder with no value stays as written. */
function fill(template, data) {
    if (!template.includes('{'))
        return template;
    if (typeof data !== 'object' || data === null)
        return template;
    const values = { ...data };
    return template.replaceAll(/\{([^{}]+)\}/g, (placeholder, key) => key in values ? String(values[key]) : placeholder);
}
export function isFailure(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    // The brand lives only on the failure prototype. JSON.parse and object literals can set
    // it as an own property but never on a prototype, so outside data (an API response, a
    // queue message, a tool result) can never pass as a failure. Checked by shape, not
    // instanceof, so two copies of this package still recognise each other's failures.
    try {
        const prototype = Object.getPrototypeOf(value);
        return (typeof prototype === 'object' &&
            prototype !== null &&
            Object.hasOwn(prototype, BRAND) &&
            !Object.hasOwn(value, BRAND));
    }
    catch {
        // Opaque/revoked objects cannot prove a failure brand. Detection owns no effects.
        return false;
    }
}
/**
 * Builds a {@link Stoppable}, so a partial-success function's return type is inferred and needs
 * no annotation: return `stoppable(value)` when the work finished, and
 * `stoppable(value, failure)` when a failure stopped it. Returns a shallow copy of `value`; the
 * `stoppedBy` key is present only when a failure is given, so a finished result has no such key.
 *
 * @example
 * async function exportAll(items: Item[]) {
 *   const delivered: Item[] = [];
 *   for (const item of items) {
 *     const sent = await send(item);
 *     if (isFailure(sent)) return stoppable({ delivered }, sent);
 *     delivered.push(item);
 *   }
 *   return stoppable({ delivered });
 * } // Promise<Stoppable<{ delivered: Item[] }, FailureOf<typeof send>>>
 */
export function stoppable(value, stoppedBy) {
    return stoppedBy === undefined ? { ...value } : { ...value, stoppedBy };
}
/** A failure thrown because the code decided it cannot happen: what {@link orThrow} throws. */
export class UnexpectedFailure extends Error {
    failure;
    code;
    status;
    remediation;
    constructor(failure) {
        super(`${failure.code}: ${failure.message}`, { cause: failure.cause });
        this.name = 'UnexpectedFailure';
        this.failure = failure;
        this.code = failure.code;
        this.status = failure.status;
        this.remediation = failure.remediation;
    }
}
export function orThrow(value) {
    if (isThenable(value))
        return Promise.resolve(value).then(orThrowNow);
    return orThrowNow(value);
}
function orThrowNow(value) {
    if (isFailure(value))
        throw new UnexpectedFailure(value);
    return value;
}
/** @internal True for promises and other thenables. */
export function isThenable(value) {
    return typeof value === 'object' && value !== null && 'then' in value && typeof value.then === 'function';
}
//# sourceMappingURL=failure.js.map