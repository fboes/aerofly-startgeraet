/**
 * @file Simple templating, converting `I have {{ count }} apples`
 * @todo Package candidate
 */

type Trim<S extends string> = S extends ` ${infer R}` ? Trim<R> : S extends `${infer L} ` ? Trim<L> : S;

// "a {{ x }} b {{y}}" → "x" | "y"
type Placeholders<S extends string> = S extends `${string}{{${infer Key}}}${infer Rest}`
    ? Trim<Key> | Placeholders<Rest>
    : never;

/**
 * CAUTION: This function does not do escaping of any kind
 *
 * @param template e.g. `I have {{ count }} apples`
 * @param vars e.g. `{ count: 2 }`
 * @returns e.g. `I have 2 apples`
 */
export function fmt<S extends string>(template: S, vars: Record<Placeholders<S>, string | number>): string {
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) =>
        key in vars ? String((vars as Record<string, string | number>)[key]) : match,
    );
}
