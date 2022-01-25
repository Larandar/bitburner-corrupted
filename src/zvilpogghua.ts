import { NS, Server } from '../NetscriptDefinitions';
import { runFor } from './_necronomicon/control';
import { Logger, LogLevel } from './_necronomicon/logger';
import { uuid } from './_necronomicon/naming';
import { availableRam } from './_necronomicon/servers';
import { CthulhuStore, loadStore } from './_necronomicon/store';

const TARGET_TIME = 2 * 60 * 1000;

/**
 * Let Zvilpoggha feast on the corrupted
 *
 * @param {NS} ns NetScript object
 */
export async function main(ns: NS): Promise<void> {
    const args = ns.flags([
        ["help", false],
        ["verbose", false],
        ["strategy", "default"],
    ])

    if (args.help || args._.length > 0) {
        ns.tprint([
            `Usage: run ${ns.getScriptName()}`,
            `Let Zvilpoggha feast on the corrupted.`,
            `Example:`,
            `  > run ${ns.getScriptName()}`
        ].join("\n"))
        return
    }

    if (SacrificeCeremonies[args.strategy] === undefined) {
        ns.tprint([
            `[ERROR]`,
            `Unknown strategy: ${args.strategy}`,
            `(available strategies: ${Object.keys(SacrificeCeremonies).join(", ")})`
        ].join(" "))
        return
    }

    ns.toast([
        "We sacrifice to thy!",
        "[[ ZVILPOGGHUA ]]",
    ].join(" << "), "success")


    const log = new Logger(ns, args.verbose ? LogLevel.DEBUG : LogLevel.INFO)

    // Strategy object
    let sacrificeCeremony = SacrificeCeremonies[args.strategy]

    // Sacrifice the corrupted to Zvilpogghua
    await runFor(ns, TARGET_TIME, async () => {
        // Find all the corrupted servers available for the ceremony
        let corruptedMembers = await findCorruptedMembers(ns)

        log.debug(`Ceremony: ${args.strategy}, Corrupted members: ${corruptedMembers.length}`)
        if (corruptedMembers.length == 0) return

        await sacrificeCeremony.sacrifice(ns, log, corruptedMembers)
    }, 10000)

    ns.spawn("cthulhu.js", 1, "--strategy", args.strategy)
}

export type CorruptionSlot = { server: Server, ram: number, cores: number }
export const RAM_RESERVES: { [key: string]: number } = {
    "home": 256,
}

/**
 * Find all the corrupted servers available for the ceremony using Cthulhu's store
 *
 * @param ns NetScript object
 * @returns Availables slots for ceremony
 */
export async function findCorruptedMembers(ns: NS): Promise<CorruptionSlot[]> {
    let cthulhu = (await loadStore(ns, "cthulhu")) as { [key: string]: string[] } | undefined
    const corruptedNames = cthulhu?.corrupted.concat(["home"]) || ["home"]
    return corruptedNames
        // Fetch the server info
        .map(hostname => ns.getServer(hostname))
        // Convert to a slot oject
        .map(server => {
            // Remove reserved ram for named servers
            let ram = availableRam(ns, server.hostname) - (RAM_RESERVES[server.hostname] ?? 0)

            return {
                server,
                ram,
                cores: server.cpuCores
            } as CorruptionSlot
        })
        // Filter out servers with no ram (so no slots on them)
        .filter(slot => slot.ram > 4)
}

interface ISacrificeCeremony {
    sacrifice(ns: NS, log: Logger, corruptionSlots: CorruptionSlot[]): Promise<void>
}

class JuicySacrificing implements ISacrificeCeremony {
    constructor(private readonly corruptionScript: string) { }

    private get corruptionPath(): string {
        return `/_corruption/${this.corruptionScript}.js`
    }


    async chooseJuicySacrifice(ns: NS): Promise<Server> {
        // NOTE: This is a very naive implementation, Yog-Sothoth should be able to do this better,
        //       but this is mainly for fallback or mass drain.

        let cthulhu: CthulhuStore | undefined = await loadStore(ns, "cthulhu")
        const subdued: Set<string> = new Set(cthulhu?.subdued)

        let juiceiests = ["powerhouse-fitness", "phantasy", "zer0", "joesguns", "n00dles"]
            .filter(s => subdued.has(s))

        if (juiceiests.length == 0) {
            ns.toast("[[ YOG-SOTHOTH SHIM ]] !! No corrupted servers found !!", "error", 1000)
            ns.exit()
        }

        let juicy = juiceiests[Math.floor(Math.random() * juiceiests.length)] as string
        return ns.getServer(juicy)
    }

    async sacrifice(ns: NS, log: Logger, corruptionSlots: CorruptionSlot[]): Promise<void> {
        let sacrificeUid = `sacrifice-${uuid().split("-")[0]}`
        for (const corruptionSlot of corruptionSlots) {
            let juiceiest = await this.chooseJuicySacrifice(ns)

            let numThreads = Math.floor(corruptionSlot.ram / ns.getScriptRam(this.corruptionPath))
            if (numThreads <= 0) continue

            let numberOfSacrifices: number = Math.ceil((2 * 60 * 1000) / ns.getHackTime(juiceiest.hostname))

            log.debug(`${corruptionSlot.server.hostname} -t ${numThreads} (${corruptionSlot.ram}GB / ${ns.getScriptRam(this.corruptionPath)}GB)`)

            let pid = ns.exec(
                this.corruptionPath,
                corruptionSlot.server.hostname,
                numThreads,
                `--uid=${sacrificeUid}-${corruptionSlot.server.hostname}`,
                juiceiest.hostname,
                numberOfSacrifices
            )

            if (pid != 0) {
                log.info(`Sharing ${numThreads} threads on ${corruptionSlot.server.hostname}`)
            } else {
                log.error(`Failed to start ${this.corruptionScript} on ${corruptionSlot.server.hostname}`)
            }
        }
    }

}

class YogSorothDelegate implements ISacrificeCeremony {
    constructor(private readonly fallback: ISacrificeCeremony) { }

    async sacrifice(ns: NS, log: Logger, corruptionSlots: CorruptionSlot[]): Promise<void> {
        // TODO: Interoperation with Yog-Sothoth (if running)
        // NOTE: This is just the fallback implementation
        return this.fallback.sacrifice(ns, log, corruptionSlots)
    }
}

class SharingCeremony implements ISacrificeCeremony {
    protected static SHARING_TIME: number = 2 * 60 * 1000
    protected static SCRIPT_PATH: string = `/_corruption/share.js`

    async sacrifice(ns: NS, log: Logger, corruptionSlots: CorruptionSlot[]): Promise<void> {
        let sharingId = `share-${uuid().split("-")[0]}`
        for (const corruptionSlot of corruptionSlots) {
            let numThreads = Math.floor(corruptionSlot.ram / ns.getScriptRam(SharingCeremony.SCRIPT_PATH))
            if (numThreads <= 0) continue

            let pid = ns.exec(
                SharingCeremony.SCRIPT_PATH,
                corruptionSlot.server.hostname,
                numThreads,
                `--uid=${sharingId}-${corruptionSlot.server.hostname}`,
                SharingCeremony.SHARING_TIME / 10000
            )

            if (pid != 0) {
                log.info(`Sharing ${numThreads} threads on ${corruptionSlot.server.hostname}`)
            } else {
                log.error(`Failed to start sharing on ${corruptionSlot.server.hostname}`)
            }
        }
    }
}


const SacrificeCeremonies: { [key: string]: ISacrificeCeremony } = {
    "default": new YogSorothDelegate(new JuicySacrificing("brain-rot")),
    "yog-sothoth": new YogSorothDelegate(new JuicySacrificing("brain-rot")),
    "brain-rot": new JuicySacrificing("brain-rot"),
    "share": new SharingCeremony(),
}
