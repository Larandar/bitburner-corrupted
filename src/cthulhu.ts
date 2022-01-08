/**
 * Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn
 */
import { NS } from '../NetscriptDefinitions';

// SECTION: High level API

/**
 * Automatically breach and corrupt servers, then delegate to Zvilpogghua for orchestration.
 *
 * @usage 5.25 GB of RAM required
 * @param {NS} ns NetScript instance
 */
export async function main(ns: NS): Promise<void> {
    const args = ns.flags([["help", false], ["corrupt-only", false]])
    if (args.help || args._.length > 0) {
        ns.tprint([
            `Usage: run ${ns.getScriptName()} [--corrupt-only]`,
            `Pray to the great Cthulhu that corruption be spread.`,
            `Flags:`,
            `  --corrupt-only: Only corrupt servers, do not call Zvilpogghua after.`,
            `Example:`,
            `  > run ${ns.getScriptName()}`
        ].join("\n"))
        return
    }

    if (ns.getHostname() != "home") {
        ns.tprint("Cthulhu growth must be started from your main cult base")
        ns.exit()
    }

    ns.toast([
        "[[ PRAISED BE CTHULHU ]]",
        "Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn!"
    ].join(" > "), "success", 10000)

    // Spread the corruption
    const corrupted = await spreadCorruption(ns)
    const subdued = corrupted.filter(server =>
        ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()
    )
    // Save corruption to global state
    let store = { corrupted, subdued }
    await ns.write("/_store/cthulhu.txt", [JSON.stringify(store)], "w")

    let availableRamGB = ns.getServerMaxRam(ns.getHostname()) - ns.getServerUsedRam(ns.getHostname())
    if (!args["corrupt-only"] && availableRamGB > 6) ns.spawn("zvilpogghua.js")
}


/**
 * Spread corruption across the network.
 *
 * @param {NS} ns NetScript instance
 */
export async function spreadCorruption(ns: NS): Promise<string[]> {
    let corrupted: string[] = []
    let scanned: Set<string> = new Set()

    // Start spreading corruption from current server
    let queue: string[] = [ns.getHostname()]
    while (queue.length > 0) {
        // Get next server to scan
        const target = queue.pop() as string

        // Skip if already scanned, and mark as scanned
        if (scanned.has(target)) continue
        scanned.add(target)

        // We don't corrupt ourselves
        if (target != "home") {
            if (await breach(ns, target)) corrupted.push(target)
        }

        // Continue spreading corruption from target server
        queue.push(...ns.scan(target))

        // Wait a bit to avoid spamming the event loop
        await ns.sleep(100)
    }

    return corrupted
}

// !SECTION

// SECTION: Low level API

/**
 * Breach the target server and deploy corruption script.
 *
 * @usage 1.3 GB of RAM required
 *
 * @param {NS} ns NetScript instance
 * @param {string} target Target server
 **/
export async function breach(ns: NS, target: string): Promise<boolean> {
    // Skip if already breached
    if (!ns.hasRootAccess(target)) {
        if (ns.getServerNumPortsRequired(target) >= 6) {
            ns.toast(`[[ BREACHING: ${target} ]] !! ERROR: requires 6 or more opened ports`, "warning", 2500)
            return false
        }

        // Breach ports
        if (ns.fileExists("SQLInject.exe", "home")) {
            ns.sqlinject(target)
        } else if (ns.getServerNumPortsRequired(target) >= 5) {
            ns.toast(`[[ BREACHING: ${target} ]] !! ERROR: requires the SQLInject.exe program`, "warning", 2500)
            return false
        }

        if (ns.fileExists("HTTPWorm.exe", "home")) {
            ns.httpworm(target)
        } else if (ns.getServerNumPortsRequired(target) >= 4) {
            ns.toast(`[[ BREACHING: ${target} ]] !! ERROR: requires the HTTPWorm.exe program`, "warning", 2500)
            return false
        }

        if (ns.fileExists("relaySMTP.exe", "home")) {
            ns.relaysmtp(target)
        } else if (ns.getServerNumPortsRequired(target) >= 3) {
            ns.toast(`[[ BREACHING: ${target} ]] !! ERROR: requires the relaySMTP.exe program`, "warning", 2500)
            return false
        }

        if (ns.fileExists("FTPCrack.exe", "home")) {
            ns.ftpcrack(target)
        } else if (ns.getServerNumPortsRequired(target) >= 2) {
            ns.toast(`[[ BREACHING: ${target} ]] !! ERROR: requires the FTPCrack.exe program`, "warning", 2500)
            return false
        }

        if (ns.fileExists("BruteSSH.exe", "home")) {
            ns.brutessh(target)
        } else if (ns.getServerNumPortsRequired(target) >= 1) {
            ns.toast(`[[ BREACHING: ${target} ]] !! ERROR: requires the BruteSSH.exe program`, "warning", 2500)
            return false
        }

        // Acquire root access if needed
        ns.nuke(target)
        ns.toast(`[[ BREACHING: ${target} ]] ** Root access acquired **`, "success", 1000)
    }

    // Transfer updated version of scripts
    let scripts = ns.ls("home").filter(f => f.startsWith("/_corruption/") && f.endsWith(".js"))
    return await ns.scp(scripts, "home", target)
}

// !SECTION