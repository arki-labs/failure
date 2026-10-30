/** Longest chain `findCause` walks; deeper chains are almost certainly cycles. */
const MAX_DEPTH = 64;
export function findCause(value, target) {
    const matches = 'is' in target ? target.is : (link) => link instanceof target;
    const seen = new Set();
    let link = value;
    for (let depth = 0; depth < MAX_DEPTH && link !== undefined && !seen.has(link); depth++) {
        if (matches(link))
            return link;
        seen.add(link);
        link = typeof link === 'object' && link !== null && 'cause' in link ? link.cause : undefined;
    }
    return undefined;
}
//# sourceMappingURL=cause.js.map