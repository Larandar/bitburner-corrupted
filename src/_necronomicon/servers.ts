import { NS } from '../../NetscriptDefinitions'


/**
 * Return the available ram on the given server (in GB)
 *
 * @param {NS} ns NetScript object
 * @returns {number} The available ram in GB
 */
export function availableRam(ns: NS, server: string | undefined = undefined): number {
    if (server === undefined) server = ns.getHostname()
    return ns.getServerMaxRam(server) - ns.getServerUsedRam(server)
}