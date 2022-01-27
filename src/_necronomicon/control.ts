import { NS } from '../../NetscriptDefinitions';

export async function runFor(ns: NS, seconds: number, fn: () => Promise<void>, delay: number = 1000): Promise<void> {
    let loop_id = [ns.getHostname(), ns.getScriptName(), performance.now()].join(":")
    performance.mark(loop_id)

    while (performance.measure(loop_id, loop_id).duration < seconds) {
        await fn()
        await ns.sleep(delay)
    }

    performance.clearMarks(loop_id)
    performance.clearMeasures(loop_id)
}