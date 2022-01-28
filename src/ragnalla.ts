import { NS } from '../NetscriptDefinitions'
import { terminalCommand } from './_necronomicon/gameHud'

/**
 * The seeker will
 *
 * @param {NS} ns NetScript object
 */
export async function main(ns: NS): Promise<void> {
    const args = ns.flags([
        ["help", false],
        ["no-connect", false],
    ])
    if (args.help || args._.length == 0) {
        ns.tprint([
            `Usage: run ${ns.getScriptName()} server|contracts [name] `,
            `Unleach Ragnalla to seek your prays.`,
            `Example:`,
            `  > run ${ns.getScriptName()} server zerO`,
            `  > run ${ns.getScriptName()} contracts`
        ].join("\n"))
        return
    }

    let action = args._.shift() as string
    switch (action) {
        case "servers":
            let servers = await networkDeepScan(ns)
            let searched = args._.map((s: string | number) => s.toString().toLowerCase())
            if (searched.size != 0) {
                Array.from(servers.keys())
                    .filter(s => !searched.some((t: string) => s.toLowerCase().match(t)))
                    .forEach(s => servers.delete(s))
            }
            if (servers.size == 0) {
                ns.tprint("Server not found.")
            } else if (servers.size > 1 || args["no-connect"]) {
                await printFinds(ns, `Found ${servers.size} servers:`, servers, "/")
            } else {
                ns.tprint("Connecting to server...")
                let path = Array.from(servers.values())[0].slice(1)
                await terminalCommand(...path.map(s => `connect ${s}`))
            }
            break
        case "contracts":
            let contracts = await findContracts(ns)
            if (contracts.size == 0) {
                ns.tprint("No contracts found.")
            } else {
                await printFinds(ns, `Found ${contracts.size} contracts:`, contracts)
            }
            break
        default:
            ns.tprint(`Unknown command: ${action}`)
    }

}

// Unsuported public API yet for autocomplete
type ServerData = { [key: string]: any }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function autocomplete(data: ServerData, args: string[]): string[] {
    console.log("Autocomplete Ragnalla:", data, args)
    if (args.find(a => a == "contracts" || a == "servers") === undefined) {
        return ["servers", "contracts"]
    }
    if (args.find(a => a == "servers") !== undefined) {
        return [...data.servers]
    }
    return []
}

export async function printFinds(ns: NS, header: string, finds: Map<string, string[]>, sep: string = ", "): Promise<void> {
    let formatedFinds = Array.from(finds.entries()).map(([server, found]) => `${server}: ${found.join(sep)}`).join("\n    > ")
    ns.tprint(`${header}\n    > ${formatedFinds}`)
}

export async function findContracts(ns: NS): Promise<Map<string, string[]>> {
    let contractMap = new Map<string, string[]>()

    Array.from((await networkDeepScan(ns)).keys()).forEach(server => {
        let contracts = ns.ls(server, ".cct")
        if (contracts.length > 0) {
            contractMap.set(server, contracts)
        }
    })

    return contractMap
}

export async function networkDeepScan(ns: NS): Promise<Map<string, string[]>> {
    let servers: Map<string, string[]> = new Map()

    let queue = [ns.getHostname()]
    servers.set(ns.getHostname(), [""])

    while (queue.length > 0) {
        let server = queue.pop() as string
        let path = servers.get(server) ?? [""]
        ns.scan(server).forEach(child => {
            if (servers.has(child)) return
            queue.push(child)
            servers.set(child, path.concat(child))
        })
    }

    return servers
}