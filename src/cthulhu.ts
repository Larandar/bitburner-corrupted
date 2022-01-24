/**
 * Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn
 */
import { NS } from '../NetscriptDefinitions';
import { availableRam } from './_necronomicon/servers';
import { CthulhuStore, loadStore, writeStore } from './_necronomicon/store';

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
        ["strategy", "default"],
    ])
    if (args.help || args._.length > 0) {
        ns.tprint([
            `Usage: run ${ns.getScriptName()}`,
            `Pray to the great Cthulhu that corruption be spread.`,
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
    ].join(" > "), "success")

    // Wake up the sleeping old-ones
    if (await startService(ns, "atlach-nacha", 16)) {
        await ns.sleep(1000)
    }

    // Spread the corruption
    const corrupted = await spreadCorruption(ns)
    const subdued = corrupted.filter(server =>
        ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()
    )
    // Save corruption to global state
    await writeStore(ns, "cthulhu", { corrupted, subdued } as CthulhuStore)

    // Wake up the sleeping old-ones
    await startService(ns, "zvilpogghua", 4, `--strategy=${args.strategy}`)
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
    let last = args[args.length - 1]
    if (!last || last.startsWith("-")) return ["--help", "--strategy"]

    if (last == "--help") return []
    if (args.slice(-2).includes("--strategy")) {
        return ["default", "yog-sothoth", "brain-rot", "drain-all", "share"]
    }

    return []
}

// !SECTION

// SECTION: Low level API

/**
 * Start a service, ensuring that ram is not saturated
 *
 * @param ns Netscript object
 * @param service service name
 * @param ramAllocation ensure the ammount of RAM GB will be available after starting (else don't start)
 * @returns PID of the service if the service have been started
 */
export async function startService(
    ns: NS,
    service: string,
    ramAllocation: number | undefined = undefined,
    ...serviceArgs: (string | number | boolean)[]
): Promise<number | undefined> {
    // Assert service scroipt exists
    if (!ns.fileExists(`${service}.js`)) throw new Error(`Undefined service: ${service}`)

    // Services are exclusive, so we kill all other instances of the same service
    ns.ps(ns.getHostname())
        .filter(process => process.filename == `${service}.js`)
        .forEach(process => ns.kill(process.pid))

    // Allocate the ram for the service
    if (ns.getScriptRam(`${service}.js`) <= availableRam(ns) - (ramAllocation ?? 0)) {
        let pid = ns.run(`${service}.js`, 1, ...serviceArgs)
        // Script started successfully
        if (0 < pid) return pid
    }

    // Could not start service
    return undefined
}

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