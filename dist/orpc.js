import { ORPCError } from '@orpc/client';
import { FAILURE_ERROR_CODES, FailureError } from './errors.js';
import { isFailure, isThenable } from './failure.js';
import { revive, wireSchema } from './revive.js';
/** Canonical definition retained across contract adapters; symbols never enter JSON error envelopes. */
export const RPC_FAILURE_DEFINITION = Symbol.for('@arki/failure/orpc/definition');
export function errorMap(...definitions) {
    const seen = new Set();
    const entries = [];
    for (const definition of definitions) {
        const { code, status, dataSchema } = definition;
        if (seen.has(code)) {
            throw new FailureError(FAILURE_ERROR_CODES.duplicateCode, `errorMap() got two definitions with the code "${code}"`, 'Give each defineFailure() a unique code, or pass the shared definition once.');
        }
        seen.add(code);
        entries.push([
            code,
            {
                status,
                ...(dataSchema === undefined ? {} : { data: wireSchema(dataSchema) }),
                [RPC_FAILURE_DEFINITION]: definition,
            },
        ]);
    }
    return Object.fromEntries(entries);
}
export function orThrowRpc(value, errors, ...success) {
    if (isThenable(value))
        return Promise.resolve(value).then(resolved => orThrowRpcNow(resolved, errors, success));
    return orThrowRpcNow(value, errors, success);
}
/** Throw the failure, or answer `success` when one was passed, else the value. */
function orThrowRpcNow(value, errors, success) {
    if (!isFailure(value))
        return success.length === 0 ? value : success[0];
    throw declaredError(value, errors);
}
export function rpcError(failure, errors) {
    return declaredError(failure, errors);
}
function declaredError(failure, errors) {
    const declared = errors[failure.code];
    // `cause` keeps the failure itself on the server (observers read it); oRPC never sends `cause` to the client.
    // Reached only when the types were bypassed: the client sees an undeclared error (`defined: false`).
    if (declared === undefined) {
        return new ORPCError(failure.code, {
            status: failure.status,
            message: failure.message,
            data: failure.data,
            cause: failure,
        });
    }
    return declared({ message: failure.message, data: failure.data, cause: failure });
}
export function rpcFailureDefinitions(map) {
    return Object.values(map).flatMap(entry => {
        const definition = entry[RPC_FAILURE_DEFINITION];
        return definition === undefined ? [] : [definition];
    });
}
/**
 * The live failure a caught `ORPCError` stands for, when its code is one of
 * `definitions`; `undefined` for any other error. Data is checked with the
 * definition's schema like `revive`, returning a typed protocol failure when it is malformed. Use it on the client to `match` on failures the
 * contract declares.
 *
 * @example
 * const post = await client.posts.byId({ id }).catch((error: unknown) => {
 *   const failure = reviveRpcError(error, [PostNotFound]);
 *   if (failure === undefined) throw error; // not a declared failure: still a bug
 *   return failure;
 * });
 * //    ^? Post | Failure<'post.not_found', { id: string }>
 */
export function reviveRpcError(error, definitions) {
    if (!(error instanceof ORPCError))
        return;
    return revive(error, definitions);
}
//# sourceMappingURL=orpc.js.map