/**
 * Format a number to a string with a unit suffix.
 *
 * @param n The number to format
 * @param precision precision to use
 */
export function formatNum(n: number, precision: number = 2): string {
    if (n < 1e3) return n.toFixed(precision)

    if (n < 1e06) return `${(n / 1e03).toFixed(precision)}k`
    if (n < 1e09) return `${(n / 1e06).toFixed(precision)}M`
    if (n < 1e12) return `${(n / 1e09).toFixed(precision)}G`
    if (n < 1e15) return `${(n / 1e12).toFixed(precision)}T`
    if (n < 1e18) return `${(n / 1e15).toFixed(precision)}P`
    if (n < 1e21) return `${(n / 1e18).toFixed(precision)}E`
    if (n < 1e24) return `${(n / 1e21).toFixed(precision)}Z`
    if (n < 1e27) return `${(n / 1e24).toFixed(precision)}Y`

    return n.toExponential(precision).replace("e+", "e")
}

/**
 * Format an object in pretty JSON string
 *
 * @param obj an JSON formatable object
 */
export const prettyJSON = (obj: any) => JSON.stringify(obj, null, 4)