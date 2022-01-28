import { NS, Singularity } from '../../NetscriptDefinitions';
import { formatNum } from '/_necronomicon/format.js';
import { Logger, LogLevel } from '/_necronomicon/logger.js';


/**
 * Script entry-point
 *
 * @param {NS} ns NetScript object
 */
export async function main(ns: NS & Singularity): Promise<void> {
    const log = new Logger(ns, LogLevel.DEBUG);

    // We start by buying all the probrams we can afford
    if (await purchaseDarkwebPrograms(ns, log)) log.info("All programs bought!")

    // Then we upgrade home server
    if (await upgradeHomeServer(ns, log)) log.info("Home server fully upgraded!")
}

export async function purchaseDarkwebPrograms(ns: NS & Singularity, log: Logger): Promise<boolean> {
    const player = ns.getPlayer()

    // Try to buy TOR node or stop here
    if (!(player.tor || ns.purchaseTor())) return false

    // Programs in the order we want them to be bought
    return [
        "BruteSSH.exe",
        "FTPCrack.exe",
        "DeepscanV1.exe",
        "relaySMTP.exe",
        "AutoLink.exe",
        "HTTPWorm.exe",
        "DeepscanV2.exe",
        "SQLInject.exe",
    ].every(program => {
        // NOTE: Using every ensure that we stop as soon as we can'n buy a program
        //       (ie. we don't less expensive ones that have lower priority)
        if (ns.fileExists(program, "home")) return true

        if (ns.purchaseProgram(program)) {
            log.toast(`Bought ${program}`, "info")
            return true
        } else {
            log.warn(`Failed to buy ${program} (not enough money?)`)
            return false
        }
    })
}

export async function upgradeHomeServer(ns: NS & Singularity, log: Logger): Promise<boolean> {
    const before = ns.getServer("home")

    while (true) {
        if (!(ns.upgradeHomeCores() || ns.upgradeHomeRam())) break
    }

    const after = ns.getServer("home")

    if (before.maxRam !== after.maxRam) {
        log.toast(
            `Home server RAM upgraded from ${formatNum(before.maxRam * 1e9, 0)}B to ${formatNum(after.maxRam * 1e9, 0)}B!`,
            "info"
        )
    }

    if (before.cpuCores !== after.cpuCores) {
        log.toast(
            `Home server cores upgraded from ${before.cpuCores} to ${after.cpuCores}!`,
            "info"
        )
    }

    // FIXME: find a way to check if we maxed home server
    return false
}
