/**
 * `@arki/failure/eslint` — the `must-use` and `no-blind-accept` rules.
 *
 * A failure is a return value, so the compiler forces a check only when the
 * value is used. A call whose result is thrown away (`await remove(id);` on a
 * `Promise<void | Failure>`) drops its failure silently. This type-aware rule
 * reports that statement, also under `void` and inside a discarded `Promise.all`.
 * Drop one on purpose with `// eslint-disable-next-line failure/must-use -- <reason>`.
 * `no-blind-accept` reports `accept(r)` when `r` was not checked by kind (see {@link noBlindAccept}).
 *
 * @example
 * // eslint.config.js
 * import failure from '@arki/failure/eslint';
 * export default [failure.configs.recommended]; // TypeScript files only
 */
import type { TSESLint } from '@typescript-eslint/utils';
/** Report a statement that discards a call which may return a failure. */
export declare const mustUse: TSESLint.RuleModule<"callbackReturn" | "mustUse", [], unknown, TSESLint.RuleListener> & {
    name: string;
};
/**
 * Report `accept(x)` when `x` is not checked by kind.
 *
 * `accept` lifts the "doomed command" rule (`@arki/journal`) for one refusal the handler checked.
 * `if (isFailure(r)) accept(r)` accepts every refusal, including codes the callee adds later, so it
 * defeats the rule. Check the kind first: `if (OutOfStock.is(r)) { accept(r); … }`.
 *
 * Every part of `x`'s type must be a failure with a literal `code`. The nearest condition
 * about it must check a named kind or an exact code; a bare `isFailure` is blind even when
 * today's result has only one refusal. Const aliases keep the same subject identity.
 */
export declare const noBlindAccept: TSESLint.RuleModule<"noBlindAccept", [{
    names: string[];
}], unknown, TSESLint.RuleListener> & {
    name: string;
};
/**
 * The plugin, with a flat `recommended` config that registers it as `failure` and turns
 * `failure/must-use` and `failure/no-blind-accept` on for TypeScript files only: the rules need
 * type information, which plain `.js` files (such as `eslint.config.js`) do not have.
 */
declare const plugin: TSESLint.FlatConfig.Plugin & {
    configs: {
        recommended: TSESLint.FlatConfig.Config;
    };
};
export default plugin;
//# sourceMappingURL=eslint.d.ts.map