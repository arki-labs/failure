/**
 * Cause chains, like Go's `errors.As`: a failure (or error) may carry a
 * `cause`, which may carry its own. `findCause` walks the chain.
 */
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { DataOf, Failure, FailureDefinition } from './failure.js';
/**
 * The first link in the cause chain, starting with `value` itself, that is a
 * failure of `definition` or an instance of the error class `kind`.
 *
 * @example
 * const synced = SyncFailed({ feed }, { cause: await readFeed(feed) });
 * const timeout = findCause(synced, DbTimeout); // typed DbTimeout failure, or undefined
 * const socket = findCause(error, ConnectionError); // a thrown error class works too
 */
export declare function findCause<Code extends string, Schema extends StandardSchemaV1 | undefined>(value: unknown, definition: FailureDefinition<Code, Schema>): Failure<Code, DataOf<Schema>> | undefined;
export declare function findCause<Instance>(value: unknown, kind: abstract new (...args: never[]) => Instance): Instance | undefined;
//# sourceMappingURL=cause.d.ts.map