import { NS } from '../../NetscriptDefinitions';

/**
 * Corrupt server by following the great old ones orders.
 *
 * @usage 2.45GB RAM
 *
 * @param {NS} ns NetScript object
 */
export async function main(ns: NS): Promise<void> {
    const args = ns.flags([
        ["help", false],
        ["uid", "null"],
    ])
    if (args.help || args._.length > 1) {
        ns.tprint([
            `Usage: run ${ns.getScriptName()} [ROUNDS]`,
            `Share the power with hack-contracts.`,
            `Flags:`,
            `  --uid=UID    UID to give to the process.`,
            `Example:`,
            `  > run ${ns.getScriptName()} -t 8`,
            `  > run ${ns.getScriptName()} -t 8 --uid uid-0123`,
            `  > run ${ns.getScriptName()} -t 8 666`
        ].join("\n"))
        return
    }

    let rounds = args._.length == 1 ? args._[0] as number : Number.MAX_SAFE_INTEGER
    for (let i = 0; i < rounds; i++) await ns.share()
}

// Unsuported public API yet for autocomplete
type ServerData = { [key: string]: any }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function autocomplete(data: ServerData, args: string[]): string[] {
    console.log(data.servers)
    return ["--uid", "--delay", ...data.servers]
}
