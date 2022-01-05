import { NS } from '../../NetscriptDefinitions';


const SILENT_FUNCTIONS = [
    "disableLog",
    "sleep",
    "getHackingLevel",
    "getServerRequiredHackingLevel",
    "getServerMaxMoney",
    "getServerMinSecurityLevel",
    "getServerSecurityLevel",
    "getServerMoneyAvailable"
]

const THRESHOLD_MONEY_PERCENT = 0.5
const THRESHOLD_MAX_SECURITY = 2.5

/**
 * Corrupt server by following the great old ones orders.
 *
 * @usage 2.45GB RAM
 *
 * @param {NS} ns NetScript object
 */
export async function main(ns: NS): Promise<void> {
    const args = ns.flags([["help", false], ["corrupt-only", false]])
    if (args.help || args._.length > 1) {
        ns.tprint([
            `Usage: run ${ns.getScriptName()} [HOST]`,
            `Corrupt the brain of an unwilling sacrifice.`,
            `Example:`,
            `  > run ${ns.getScriptName()} -t 8 foodnstuff`
        ].join("\n"))
        return
    }

    ns.print("[[ SILENCING THE VOICES ]]")
    SILENT_FUNCTIONS.forEach(ns.disableLog)

    let target = args._.length > 0 ? ns.args[0] as string : ns.getHostname() // RAM: 0.05GB
    if (target == "home" || target.startsWith("cult1st-")) {
        ns.toast(`Prevented corruption of the cult's resources from ${ns.getHostname()}.`, "error", 5000)
        return
    }

    let moneyThresh = ns.getServerMaxMoney(target) * THRESHOLD_MONEY_PERCENT // RAM: 0.1GB
    let securityThresh = ns.getServerMinSecurityLevel(target) + THRESHOLD_MAX_SECURITY // RAM: 0.1GB

    let rounds = ns.args.length > 1 ? ns.args[1] as number : Number.MAX_SAFE_INTEGER // RAM: 0.1GB

    for (let i = 0; i < rounds; i++) {
        await corrupt(ns, target, securityThresh, moneyThresh)
        await ns.sleep(500)
    }
}

export async function corrupt(ns: NS, target: string, securityThresh: number, moneyThresh: number): Promise<void> {
    ns.print(`[[ SACRIFICING TO ZVILPOGGHUA: ${target} ]]`)

    let security = ns.getServerSecurityLevel(target) // RAM: 0.1GB
    let fSecurity = ns.nFormat(security, "0.00")
    ns.print(`  security=${fSecurity} (${security > securityThresh},thres=${securityThresh})`)

    let money = ns.getServerMoneyAvailable(target) // RAM: 0.1GB
    let fMoney = ns.nFormat(money, "0")
    ns.print(`  money=${fMoney} (${money < moneyThresh},thres=${moneyThresh})`)

    if (security > securityThresh) {
        ns.print(`>> By Gloon's name I curse thy!`)
        await ns.weaken(target); // RAM: 0.15GB
    } else if (money < moneyThresh) {
        ns.print(`>> May Istasha's darkness grows... `)
        await ns.grow(target); // RAM: 0.15GB
    } else {
        ns.print(`** Almightty Zvilpogghua accept this ripe offering! **`)
        await ns.hack(target); // RAM: 0.1GB
    }
}