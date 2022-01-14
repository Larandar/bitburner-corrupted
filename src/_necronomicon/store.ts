import { NS } from '../../NetscriptDefinitions'


export type CthulhuStore = {
    corrupted: string[],
    subdued: string[],
}

/**
 * Store data owned by a service for later use
 *
 * @param {NS} ns NetScript object
 * @param {string} service owner of the store
 * @param {any} store data to store
 */
export async function writeStore<T = { [key: string]: any }>(ns: NS, service: string, store: T): Promise<void> {
    await ns.write(`/_store/${service}.txt`, [JSON.stringify(store)], "w")
}

/**
 * Retrieve store data
 *
 * @param ns NetScript object
 * @param service owner du store
 * @returns data of the store
 */
export async function loadStore<T = { [key: string]: any }>(ns: NS, service: string): Promise<T | undefined> {
    if (ns.fileExists(`/_store/${service}.txt`, ns.getHostname())) {
        return JSON.parse(await ns.read(`/_store/${service}.txt`)) as T
    }
    return undefined
}
