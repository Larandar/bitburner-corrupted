/**
 * Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn
 */
import { NS } from '../NetscriptDefinitions';
import { CthulhuStore, loadStore, writeStore } from './_necronomicon/store';
import { availableRamGB } from './_necronomicon/utils';

// SECTION: High level API

/**
 * Automatically breach and corrupt servers, then delegate to Zvilpogghua for orchestration.
 *
 * @usage 5.25 GB of RAM required
 * @param {NS} ns NetScript instance
 */
export async function main(ns: NS): Promise<void> {
    const args = ns.flags([
        ["help", false],
        ["corrupt-only", false],
        ["bootstrap", false]
    ])
    if (args.help || args._.length > 0) {
        ns.tprint([
            `Usage: run ${ns.getScriptName()} [--bootstrap] [--corrupt-only]`,
            `Pray to the great Cthulhu that corruption be spread.`,
            `Flags:`,
            `  --bootstrap: Start the one-time only scripts (exploit of n00dles).`,
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

    // Wake up the sleeping old-ones
    if (await availableRamGB(ns) > 12) {
        ns.exec("atlach-nacha.js", ns.getHostname())
        await ns.sleep(1000)
    }

    // Spread the corruption
    const corrupted = await spreadCorruption(ns)
    const subdued = corrupted.filter(server =>
        ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()
    )
    // Save corruption to global state
    await writeStore(ns, "cthulhu", { corrupted, subdued } as CthulhuStore)

    // Bootstrap the corruption
    if (args["bootstrap"]) {
        // Kill scripts on n00dles
        // NOTE: `kill` and `ps` are used later in this script therefore don't add ram cost (`killall` +1GB)
        ns.ps("n00dles").forEach(process => ns.kill(process.filename, "n00dles", ...process.args))
        ns.exec("/_corruption/hack.js", "n00dles", 2, "n00dles")

        // Clear all current corruption run
        ns.ps(ns.getHostname())
            .filter(process => process.filename.startsWith("/_corruption/"))
            .forEach(process => ns.kill(process.filename, ns.getHostname(), ...process.args))

        let availableRamGB = ns.getServerMaxRam(ns.getHostname()) - ns.getServerUsedRam(ns.getHostname())
        let exploitingThreads = Math.min(Math.floor((availableRamGB - 12) / 1.75), 120)
        if (exploitingThreads > 0) {
            ns.toast(`Corrupting n00dles with ${exploitingThreads} threads`)
            ns.exec("/_corruption/hack.js", ns.getHostname(), exploitingThreads / 6, "--uid", "exploit-0", "n00dles")
            ns.exec("/_corruption/hack.js", ns.getHostname(), exploitingThreads / 6, "--uid", "exploit-1", "n00dles")
            ns.exec("/_corruption/hack.js", ns.getHostname(), exploitingThreads / 6, "--uid", "exploit-2", "n00dles")
            ns.exec("/_corruption/grow.js", ns.getHostname(), exploitingThreads / 6, "--uid", "exploit-0", "n00dles")
            ns.exec("/_corruption/grow.js", ns.getHostname(), exploitingThreads / 6, "--uid", "exploit-1", "n00dles")
            ns.exec("/_corruption/weaken.js", ns.getHostname(), exploitingThreads / 6, "--uid", "exploit", "n00dles")
        }
    }

    // Wake up the sleeping old-ones
    if (!args["corrupt-only"] && await availableRamGB(ns) > 6) {
        ns.ps(ns.getHostname())
            .filter(process => process.filename == "zvilpogghua.js")
            .forEach(process => ns.kill(process.filename, ns.getHostname(), ...process.args))
        ns.spawn("zvilpogghua.js")
    }
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

    // Load previous store value to hasten the exploration process
    let previousScan = (await loadStore<CthulhuStore>(ns, "cthulhu"))?.corrupted
    if (previousScan !== undefined) queue.push(...corrupted)

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
        queue.push(...ns.scan(target).filter(s => !scanned.has(s)))

        // Wait a bit to avoid spamming the event loop
        await ns.sleep(1)
    }

    return corrupted
}

// Unsuported public API yet for autocomplete
type ServerData = { [key: string]: any }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function autocomplete(data: ServerData, args: string[]): string[] {
    return ["--bootstrap", "--corrupt-only"]
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
            return false
        }

        if (ns.fileExists("HTTPWorm.exe", "home")) {
            ns.httpworm(target)
        } else if (ns.getServerNumPortsRequired(target) >= 4) {
            return false
        }

        if (ns.fileExists("relaySMTP.exe", "home")) {
            ns.relaysmtp(target)
        } else if (ns.getServerNumPortsRequired(target) >= 3) {
            return false
        }

        if (ns.fileExists("FTPCrack.exe", "home")) {
            ns.ftpcrack(target)
        } else if (ns.getServerNumPortsRequired(target) >= 2) {
            return false
        }

        if (ns.fileExists("BruteSSH.exe", "home")) {
            ns.brutessh(target)
        } else if (ns.getServerNumPortsRequired(target) >= 1) {
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