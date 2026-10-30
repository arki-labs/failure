import { isFailure } from './failure.js';
export function partition(values) {
    const successes = [];
    const failures = [];
    for (const value of values)
        (isFailure(value) ? failures : successes).push(value);
    return [successes, failures];
}
export function collect(values) {
    return values.find(value => isFailure(value)) ?? [...values];
}
//# sourceMappingURL=collect.js.map