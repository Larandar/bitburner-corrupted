import { NS } from '../NetscriptDefinitions';

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

const INFECTION_LENGTH_PRE_100 = 60 * 1000 // 1 minutes
const INFECTION_LENGTH_POST_100 = 2 * 60 * 1000 // 2 minutes

/**
 * Let Zvilpoggha feast on the corrupted
 *
 * Read corrupted list from `/_store/cthulhu.json`
 *
 * @param {NS} ns NetScript object
 */
export async function main(ns: NS): Promise<void> {
    const args = ns.flags([["help", false]])
    if (args.help || args._.length > 0) {
        ns.tprint([
            `Usage: run ${ns.getScriptName()}`,
            `Let Zvilpoggha feast on the corrupted.`,
            `Example:`,
            `  > run ${ns.getScriptName()}`
        ].join("\n"))
        return
    }

    ns.toast([
        "[[ ALMIGHTY ZVILPOGGHUA WE SACRIFICE TO THY ]]",
    ].join(" > "), "success", 1000)

    ns.print("[[ SILENCING THE VOICES ]]")
    SILENT_FUNCTIONS.forEach(ns.disableLog)

    let cthulhu = (await loadStore(ns, "cthulhu")) as { [key: string]: string[] }
    const corrupted = cthulhu.corrupted.concat(["home"])

    const infection_length = ns.getHackingLevel() >= 100 ? INFECTION_LENGTH_POST_100 : INFECTION_LENGTH_PRE_100

    let infection_id = [ns.getHostname(), ns.getScriptName(), performance.now()].join(":")
    performance.mark(infection_id)

    // Sacrifice the corrupted to Zvilpogghua
    while (performance.measure(infection_id, infection_id).duration < infection_length) {
        for (let target of corrupted) {
            let script = "/_corruption/brain-rot.js"
            // Infection not yet finished
            if (ns.scriptRunning("/_corruption/brain-rot.js", target)) continue


            let sacrifice = await chooseSacrifice(ns)
            let availableRam = ns.getServerMaxRam(target) - ns.getServerUsedRam(target)

            if (target == "home") availableRam -= 256 // 256GB RAM of reserve on home server

            let possibleThreads = Math.floor(availableRam / ns.getScriptRam(script, target))
            if (possibleThreads <= 0) continue

            // Run to fill half the running time (so we don't have to update too often)
            let count = Math.max(Math.floor((infection_length / 4) / ns.getHackTime(target)), 1)

            ns.print(`Infecting ${target} with ${script} (${count}x)`)
            ns.exec(script, target, possibleThreads, sacrifice, count)
        }
        await ns.sleep(1000)
    }

    performance.clearMarks(infection_id)
    performance.clearMeasures(infection_id)

    ns.spawn("cthulhu.js")
}

export async function loadStore(ns: NS, service: string): Promise<{ [key: string]: any }> {
    if (ns.fileExists(`/_store/${service}.txt`, ns.getHostname())) {
        return JSON.parse(await ns.read(`/_store/${service}.txt`))
    }
    return {}
}

/**
 * Choose the juiceiest sacrifice from the predefined list in case there is Yog-Sothoth is not running
 *
 * @param {NS} ns NetScript object
 *
 * @returns the choosen sacrifice
 */
export async function chooseSacrifice(ns: NS): Promise<string> {
    // TODO: Interoperation with Yog-Sothoth
    // NOTE: This is a very naive implementation

    let cthulhu = (await loadStore(ns, "cthulhu")) as { [key: string]: string[] }
    const subdued: Set<string> = new Set(cthulhu.subdued)

    let juiceiests = ["powerhouse-fitness", "phantasy", "zer0", "joesguns", "n00dles"]
        .filter(s => subdued.has(s))
        .filter((_, i) => i < 3)

    if (juiceiests.length == 0) {
        ns.toast("[[ YOG-SOTHOTH SHIM ]] !! No corrupted servers found !!", "error", 1000)
        ns.exit()
    }

    return juiceiests[Math.floor(Math.random() * juiceiests.length)] as string
}