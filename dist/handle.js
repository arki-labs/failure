import { FAILURE_ERROR_CODES, FailureError } from './errors.js';
import { isFailure } from './failure.js';
export function match(value, handlers) {
    const key = isFailure(value) ? value.code : 'ok';
    const handler = handlers[key];
    if (handler === undefined) {
        throw new FailureError(FAILURE_ERROR_CODES.unhandledFailure, `match() has no handler for "${key}"`, 'Add a handler for this code. The type of match() lists every code the value can carry, so this only happens when the types were bypassed.');
    }
    return handler(value);
}
export function recover(value, handlers) {
    if (!isFailure(value))
        return value;
    const handler = handlers[value.code];
    return handler === undefined ? value : handler(value);
}
/**
 * Mark a branch that cannot be reached. Put it in the `default` of a switch
 * over a union: when the union gains a member, the call stops compiling.
 * The default message never contains the value, because it may be a secret.
 *
 * @example
 * switch (shape.kind) {
 *   case 'circle': return area(shape);
 *   case 'square': return side(shape) ** 2;
 *   default: return unreachable(shape);
 * }
 */
export function unreachable(_value, message) {
    throw new FailureError(FAILURE_ERROR_CODES.unreachable, message ?? 'unreachable() was reached', 'A union gained a member this code does not handle. Add a branch for it.');
}
/**
 * Prove a condition the surrounding code relies on. A falsy condition is a bug
 * in the caller, so it throws a {@link FailureError}; afterwards the compiler
 * treats the condition as true. The message may be a function, built only on failure.
 *
 * @example
 * invariant(user !== undefined, () => `user ${id} must be loaded`);
 */
export function invariant(condition, message) {
    if (condition)
        return;
    throw new FailureError(FAILURE_ERROR_CODES.invariant, (typeof message === 'function' ? message() : message) ?? 'invariant() failed', 'The code assumed something that is not true. Fix the caller that broke it; do not catch this.');
}
//# sourceMappingURL=handle.js.map