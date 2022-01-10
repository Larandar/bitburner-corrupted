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
        ["delay", "0,0"],
    ])
    if (args.help || args._.length > 2) {
        ns.tprint([
            `Usage: run ${ns.getScriptName()} [SACRIFICE [COUNT]]`,
            `Corrupt the brain of an unwilling sacrifice.`,
            `Flags:`,
            `  --uid=UID    UID to give to the process.`,
            `  --delay=MS   Delay before starting the process. A pair can`,
            `               be given to delay between each process.`,
            `Example:`,
            `  > run ${ns.getScriptName()} -t 8 foodnstuff`,
            `  > run ${ns.getScriptName()} -t 8 --uid uid-0123 foodnstuff`,
            `  > run ${ns.getScriptName()} -t 8 --delay 1 foodnstuff 5`,
            `  > run ${ns.getScriptName()} -t 8 --delay 1,1 foodnstuff 5`,
            `  > run ${ns.getScriptName()} -t 8 foodnstuff 666`
        ].join("\n"))
        return
    }

    let sacrifice = args._.length > 0 ? args._[0] as string : ns.getHostname() // RAM: 0.05GB
    if (sacrifice == "home" || sacrifice.startsWith("cult1st-")) {
        ns.toast(`Prevented corruption of the cult's resources from ${ns.getHostname()}.`, "error", 5000)
        return
    }

    let rounds = args._.length > 1 ? args._[1] as number : Number.MAX_SAFE_INTEGER

    args.delay = (args.delay as string).split(",").map(x => Number(x))
    let delayBefore = args.delay.shift() ?? 0
    let delayAfter = args.delay.shift() ?? 0

    if (args.delay.length > 0) {
        ns.print(`Unused arguments arguments (only take 2): ${args.delay.join(", ")}`)
    }

    for (let i = 0; i < rounds; i++) {
        await ns.sleep(delayBefore)
        await ns.grow(sacrifice)
        await ns.sleep(delayAfter)
    }
}

// Unsuported public API yet for autocomplete
type ServerData = { [key: string]: any }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function autocomplete(data: ServerData, args: string[]): string[] {
    console.log(data.servers)
    return ["--uid", "--delay", ...data.servers]
}
