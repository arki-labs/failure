/**
 * `@arki/failure/orpc` — failures at an oRPC boundary.
 *
 * Define each failure once with `defineFailure`. The contract lists them with
 * `errorMap(...)`, so the client gets typed errors. The procedure hands the
 * usecase's result to `orThrowRpc(...)`, which returns the value or throws the
 * matching `ORPCError`. It also takes the handler's `errors`, so a failure the
 * usecase can return but the contract does not list is a compile error. On the
 * client, `reviveRpcError(...)` turns the caught `ORPCError` back into the failure.
 *
 * @example
 * // model/errors.ts
 * export const PostNotFound = defineFailure('post.not_found', { status: 404, data: z.object({ id: PostId }) });
 * // entrypoints/rpc.ts
 * byId: oc.errors(errorMap(PostNotFound)).input(z.object({ id: PostId })).output(PostSchema),
 * // entrypoints/procedures.ts
 * byId: impl => impl.byId.handler(({ context, input, errors }) => orThrowRpc(context.usecases.find(input.id), errors)),
 * // the frontend: the caught ORPCError back as the failure, ready for match()
 * const failure = reviveRpcError(error, [PostNotFound]);
 */
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { Failure } from './failure.js';
/** The parts of a `FailureDefinition` an error map needs. */
type DefinitionShape = {
    readonly code: string;
    readonly status: number;
    readonly dataSchema: StandardSchemaV1 | undefined;
};
/** Canonical definition retained across contract adapters; symbols never enter JSON error envelopes. */
export declare const RPC_FAILURE_DEFINITION: unique symbol;
/** The oRPC error map for a list of definitions: one entry per code, with its status and data schema. */
export type ErrorMapOf<Definitions extends readonly DefinitionShape[]> = {
    readonly [Definition in Definitions[number] as Definition['code']]: Definition['dataSchema'] extends StandardSchemaV1 ? {
        readonly status: number;
        readonly [RPC_FAILURE_DEFINITION]: Definition;
        readonly data: StandardSchemaV1<StandardSchemaV1.InferOutput<Definition['dataSchema']>, StandardSchemaV1.InferOutput<Definition['dataSchema']>>;
    } : {
        readonly status: number;
        readonly [RPC_FAILURE_DEFINITION]: Definition;
    };
};
/**
 * The oRPC error map for these definitions, for a contract's `.errors(...)`.
 * Two definitions with the same code throw `ARKI_FAILURE_E005`.
 */
export declare function errorMap<const Definitions extends readonly DefinitionShape[]>(...definitions: Definitions): ErrorMapOf<Definitions>;
/** One oRPC error constructor, as the handler's `errors` object holds them. */
type ErrorConstructor<Data> = (options: {
    readonly message: string;
    readonly data: Data;
    readonly cause?: unknown;
}) => Error;
/**
 * The handler's `errors` must hold a constructor for every failure code the
 * value can carry. A code the contract does not list is a missing property.
 */
export type DeclaredErrors<Value> = {
    readonly [Code in Extract<Value, Failure>['code']]: ErrorConstructor<Extract<Value, Failure<Code>>['data']>;
};
/**
 * The value, or throw its failure through the handler's `errors`, the typed
 * `ORPCError` the contract declares (same code, status, message and data).
 * Pass the handler's `errors`: a failure the contract does not list is a
 * compile error. Takes a promise too, so a handler can return
 * `orThrowRpc(usecase(input), errors)` directly.
 *
 * With a third argument it answers `success` instead of the value, for a
 * usecase that returns nothing or a failure:
 * `return orThrowRpc(await disconnect(id), errors, { success: true })`.
 */
export declare function orThrowRpc<Value>(value: PromiseLike<Value>, errors: NoInfer<DeclaredErrors<Value>>): Promise<Exclude<Value, Failure>>;
export declare function orThrowRpc<Value>(value: Value, errors: NoInfer<DeclaredErrors<Awaited<Value>>>): Exclude<Value, Failure>;
export declare function orThrowRpc<Value, Success>(value: PromiseLike<Value>, errors: NoInfer<DeclaredErrors<Value>>, success: Success): Promise<Success>;
export declare function orThrowRpc<Value, Success>(value: Value, errors: NoInfer<DeclaredErrors<Awaited<Value>>>, success: Success): Success;
/**
 * The typed `ORPCError` the contract declares for a failure you already hold
 * (same code, status, message and data), to throw: `throw rpcError(failure, errors)`.
 * Pass the handler's `errors`: a failure the contract does not list is a
 * compile error. For a value that may or may not be a failure, use {@link orThrowRpc}.
 */
export declare function rpcError<F extends Failure>(failure: F, errors: NoInfer<DeclaredErrors<F>>): Error;
/** The parts of a definition {@link reviveRpcError} needs: the same as `revive`. */
type RevivableDefinition = {
    readonly code: string;
    readonly dataSchema: StandardSchemaV1 | undefined;
    (...args: never[]): Failure;
};
type RpcFailureSource = {
    readonly status?: number;
    readonly data?: StandardSchemaV1;
    readonly message?: string;
    readonly [RPC_FAILURE_DEFINITION]?: RevivableDefinition;
};
type RetainedDefinition<Entry> = Entry extends unknown ? typeof RPC_FAILURE_DEFINITION extends keyof Entry ? Extract<Entry[typeof RPC_FAILURE_DEFINITION], RevivableDefinition> : never : never;
/** Read the original definitions from a native contract without rebuilding failure types or schemas. */
export declare function rpcFailureDefinitions<const Map extends Readonly<Record<string, RpcFailureSource>>>(map: Map): RetainedDefinition<Map[keyof Map]>[];
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
export declare function reviveRpcError<const Definitions extends readonly RevivableDefinition[]>(error: unknown, definitions: Definitions): ReturnType<Definitions[number]> | import("./revive.js").RevivalFailure | undefined;
export {};
//# sourceMappingURL=orpc.d.ts.map