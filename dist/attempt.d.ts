/**
 * Run `run`. If it throws (or its promise rejects), return `onThrow(cause)`
 * instead. A mapper that throws itself passes the error on, so it can map the
 * errors it knows and rethrow the rest.
 *
 * @example
 * const body = attempt(() => JSON.parse(text) as unknown, cause => InvalidJson({ reason: String(cause) }));
 * //    ^? unknown | Failure<'request.invalid_json', { reason: string }>
 * const page = await attempt(() => fetchPage(url), () => null); // like Laravel's rescue()
 */
export declare function attempt<Value, Mapped>(run: () => PromiseLike<Value>, onThrow: (cause: unknown) => Mapped): Promise<Value | Mapped>;
export declare function attempt<Value, Mapped>(run: () => Value, onThrow: (cause: unknown) => Mapped): Value | Mapped;
//# sourceMappingURL=attempt.d.ts.map