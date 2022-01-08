import { NS } from '../../NetscriptDefinitions';

/**
 * Corrupt server by following the great old ones orders.
 *
 * @usage 2.45GB RAM
 *
 * @param {NS} ns NetScript object
 */
export async function main(ns: NS): Promise<void> {
    const args = ns.flags([["help", false], ["uid", "null"]])
    if (args.help || args._.length > 2) {
        ns.tprint([
            `Usage: run ${ns.getScriptName()} [SACRIFICE [COUNT]]`,
            `Corrupt the brain of an unwilling sacrifice.`,
            `Example:`,
            `  > run ${ns.getScriptName()} -t 8 foodnstuff`,
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

    for (let i = 0; i < rounds; i++) {
        await ns.weaken(sacrifice); // RAM: 0.1GB
        await ns.sleep(500)
    }
}