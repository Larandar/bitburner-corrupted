import { NS } from '../NetscriptDefinitions';
import { Logger, LogLevel } from './_necronomicon/logger';
import { availableRam } from './_necronomicon/servers';

const RAM_RESERVED = 4;

/**
 * Listen to all the voices, in the interest of the cult.
 *
 * @param {NS} ns NetScript object
 */
export async function main(ns: NS): Promise<void> {
    const log = new Logger(ns, LogLevel.DEBUG)

    await listenVoice(ns, log, 'gossips')
    await listenVoice(ns, log, 'compulsive-buyers')
}


export async function listenVoice(ns: NS, log: Logger, voice: string, ...args: any): Promise<void> {
    let voicePath = `/_voices/${voice}.js`

    if (ns.getScriptRam(voicePath) > availableRam(ns) - RAM_RESERVED) {
        log.warn(`Voice ${voice} is too loud. Skipping.`)
        return
    }

    let pid = ns.run(voicePath, 1, ...args)

    if (pid < 0) {
        log.error(`Voice ${voice} failed to start`)
        return
    }

    log.info(`Listeting to voice of: ${voice}`)
    while (ns.isRunning(pid, ns.getHostname())) await ns.sleep(500)
}