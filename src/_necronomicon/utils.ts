import { NS } from '../../NetscriptDefinitions';

/**
 * Script entry-point
 *
 * @param {NS} ns NetScript object
 */
export async function availableRamGB(ns: NS, server: string | undefined = undefined): Promise<number> {
    if (server === undefined) server = ns.getHostname()
    return ns.getServerMaxRam(ns.getHostname()) - ns.getServerUsedRam(ns.getHostname())
}