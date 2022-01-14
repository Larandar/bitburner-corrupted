import { NS } from '../../NetscriptDefinitions';

/**
 * Return the available ram on the given server
 *
 * @param {NS} ns NetScript object
 * @returns {number} The available ram in GB
 */
export async function availableRamGB(ns: NS, server: string | undefined = undefined): Promise<number> {
    if (server === undefined) server = ns.getHostname()
    return ns.getServerMaxRam(ns.getHostname()) - ns.getServerUsedRam(ns.getHostname())
}

/**
 * Run the given commands in the terminal.
 *
 * @remark Will only work if the curren windows is the terminal.
 * @param {string[]} commands the commands to run
 */
export async function terminalCommand(...commands: string[]) {
    const d = eval("windo" + "w.docume" + "nt") as Document
    const input = d.getElementById("terminal-input") as HTMLInputElement
    input.value = commands.join("; ")
    // @ts-ignore: React event handler
    const handler: any = input[Object.keys(input)[1]]
    handler.onChange({ target: input })
    handler.onKeyDown({ keyCode: 13, preventDefault: () => null })
}