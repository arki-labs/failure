/**
 * The boundary with code that throws (`JSON.parse`, `fetch`, a driver, a
 * third-party SDK): run it, and turn a throw into a value you choose, usually
 * a failure. The mapper is required, so no failure is ever typed `unknown`.
 */
import { isThenable } from './failure.js';
export function attempt(run, onThrow) {
    try {
        const value = run();
        return isThenable(value) ? Promise.resolve(value).then(undefined, onThrow) : value;
    }
    catch (error) {
        return onThrow(error);
    }
}
//# sourceMappingURL=attempt.js.map