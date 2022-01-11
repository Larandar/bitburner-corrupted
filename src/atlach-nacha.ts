import { NodeStats, NS } from '../NetscriptDefinitions';
import { randomName, uuid } from './_necronomicon/naming';

/**
 * Grow the cult size by recuiting Nethack and Servers.
 *
 * @param {NS} ns NetScript object
 */
export async function main(ns: NS): Promise<void> {
    let cultRecruits = 0
    while (await shouldContinue(ns)) {
        let recruitmentRound = await recruitServer(ns)
        if (!recruitmentRound) break

        cultRecruits++

        await ns.sleep(1)
    }

    let hacknetRecruits: HacknetRecruits = { purchasedNodes: 0, purchasedLevels: 0, purchasedRam: 0, purchasedCores: 0 }
    while (await shouldContinue(ns)) {
        let recruitmentRound = await recruitHacknet(ns)
        if (recruitmentRound.purchasedNodes == 0) break

        hacknetRecruits.purchasedNodes += recruitmentRound.purchasedNodes
        hacknetRecruits.purchasedLevels += recruitmentRound.purchasedLevels
        hacknetRecruits.purchasedRam += recruitmentRound.purchasedRam
        hacknetRecruits.purchasedCores += recruitmentRound.purchasedCores

        await ns.sleep(1)
    }

    notifyCultLeader(ns, cultRecruits, hacknetRecruits)
}

/**
 * Euristic for the amound of money to spend on one upgrade.
 *
 * @param {NS} ns NetScript object
 * @returns amount of spendable $ (on 1 item).
 */
export async function purchaseMaxCost(ns: NS): Promise<number> {
    let playerMoney = ns.getServerMoneyAvailable("home")
    let disposableIncome = Math.min(await totalProduction(ns), playerMoney * 0.1)
    return Math.max(
        50000,
        disposableIncome,
        playerMoney * 0.01
    )
}

/**
 * Evaluate if the script should continue spend money on recruits.
 *
 * @param {NS} ns NetScript object
 * @returns Wether if the script should continue to spend money.
 */
export async function shouldContinue(ns: NS): Promise<boolean> {
    // Bootstrap to 2k/sec
    if (await totalProduction(ns) < 2e3) return true

    let playerMoney = ns.getServerMoneyAvailable("home")
    let hackingLevel = ns.getHackingLevel()

    // Pocket change
    if (playerMoney < 500e3) return false

    // Keep enough to buy the next software
    if (hackingLevel >= 100 && !ns.fileExists("FTPCrack.exe", "home")) return playerMoney > 1.5e6
    if (await totalProduction(ns) < 10e3) return true

    if (hackingLevel >= 150 && !ns.fileExists("relaySMTP.exe", "home")) return playerMoney > 5e6
    if (await totalProduction(ns) < 25e3) return true

    if (hackingLevel >= 200 && !ns.fileExists("HTTPWorm.exe", "home")) return playerMoney > 30e6
    if (await totalProduction(ns) < 50e3) return true

    if (hackingLevel >= 500 && !ns.fileExists("SQLInject.exe", "home")) return playerMoney > 250e6
    return true
}

/**
 * Recruit a server if possible, replacing old ones if needed.
 *
 * @param {NS} ns NetScript object
 * @returns if the cult leader recruited (or replaced) a member
 */
export async function recruitServer(ns: NS): Promise<boolean> {
    // Max cost we are ready to spend
    let maxCost = await purchaseMaxCost(ns) * 8
    if (ns.getServerMoneyAvailable("home") < maxCost) return false

    // Get the best server
    let purchasedServers = ns.scan("home").filter(s => s.startsWith("cult1st-"))
    let purchaseRam = purchasedServers.map(s => ns.getServerMaxRam(s)).reduce((a, b) => Math.max(a, b), 8)

    // We can't afford to buy a new server
    if (ns.getPurchasedServerCost(purchaseRam) > maxCost) return false

    // Try to grow the ram amount
    while (ns.getPurchasedServerCost(purchaseRam * 2) < maxCost) purchaseRam *= 2
    purchaseRam = Math.min(ns.getPurchasedServerMaxRam(), purchaseRam)

    // Make a name for the new server
    let serverName = await generateServerName(ns)

    // We can afford to delete a server if it has less RAM
    if (purchasedServers.length == ns.getPurchasedServerLimit()) {
        let serverToReplace = purchasedServers.reduce((a, b) => ns.getServerMaxRam(a) < ns.getServerMaxRam(b) ? a : b)
        if (ns.getServerMaxRam(serverToReplace) > purchaseRam) return false

        ns.deleteServer(serverToReplace)
        serverName = serverToReplace
    }

    // Purchase the server
    return ns.purchaseServer(serverName, purchaseRam) !== ""
}

/**
 * Recruit Hacknet nodes.
 *
 * @param {NS} ns NetScript object
 * @returns Amount of recruits and upgrades purchased.
 */
type HacknetRecruits = { purchasedNodes: number, purchasedLevels: number, purchasedRam: number, purchasedCores: number }
export async function recruitHacknet(ns: NS): Promise<HacknetRecruits> {
    const hacknet = ns.hacknet

    let maxCost = await purchaseMaxCost(ns)
    let upgrades = { purchasedNodes: 0, purchasedLevels: 0, purchasedRam: 0, purchasedCores: 0 }

    // Purchase a node if possible
    if (hacknet.getPurchaseNodeCost() < maxCost) {
        let newNode = hacknet.purchaseNode()
        if (newNode != -1) {
            upgrades.purchasedNodes++
            // I'm a bit anal about levels...
            if (hacknet.upgradeLevel(newNode, 9)) upgrades.purchasedLevels += 10
        }
    }

    // Then upgrade node after node
    let nodes = await listNodes(ns)
    nodes.map((_, i) => i).forEach(i => {
        if (hacknet.getLevelUpgradeCost(i, 10) < maxCost) {
            if (hacknet.upgradeLevel(i, 10)) {
                upgrades.purchasedLevels += 10
            }
        }

        if (hacknet.getRamUpgradeCost(i, 1) < maxCost) {
            if (hacknet.upgradeRam(i, 1)) {
                upgrades.purchasedRam++
            }
        }

        if (hacknet.getCoreUpgradeCost(i, 1) < maxCost) {
            if (hacknet.upgradeCore(i, 1)) {
                upgrades.purchasedCores++
            }
        }
    })

    return upgrades
}

/**
 * List all the hacknet nodes.
 *
 * @param {NS} ns NetScript object
 * @returns List of nodes.
 */
export async function listNodes(ns: NS): Promise<NodeStats[]> {
    let nodes: NodeStats[] = []
    for (let i = 0; i < ns.hacknet.numNodes(); i++) nodes.push(ns.hacknet.getNodeStats(i))
    return nodes
}

/**
 * Compute the total production of the hacknet nodes.
 *
 * @param {NS} ns NetScript object
 * @returns Total $/sec of the hacknet nodes.
 */
export async function totalProduction(ns: NS): Promise<number> {
    return (await listNodes(ns)).reduce((total, node) => total + node.production, 0)
}

/**
 * Generate a random name for a new server, with insurance that no other server is named the same.
 *
 * @param {NS} ns NetScript object
 * @returns a server name that does not exist.
 */
export async function generateServerName(ns: NS): Promise<string> {
    while (true) {
        let serverName = `cult1st-${randomName()}-${uuid().split('-')[0]}`
        if (!ns.serverExists(serverName)) return serverName
    }
}

/**
 * Spamming the tosts for every single recruit is annoying.
 *
 * @param {NS} ns NetScript object
 * @param {HacknetRecruits} hacknetRecruits Hacknet Recruits.
 */
export async function notifyCultLeader(ns: NS, cultRecruits: number, hacknetRecruits: HacknetRecruits): Promise<void> {
    if (cultRecruits > 0) {
        ns.toast(`[[ ATLACH-NACHA ]] >> Recruited ${cultRecruits} servers.`)
    }

    if (hacknetRecruits.purchasedNodes > 0 || hacknetRecruits.purchasedLevels > 0 || hacknetRecruits.purchasedRam > 0 || hacknetRecruits.purchasedCores > 0) {
        let upgrades = [`[[ ATLACH-NACHA ]] >>`]

        if (hacknetRecruits.purchasedNodes > 0) {
            upgrades.push(`Recruited ${hacknetRecruits.purchasedNodes} nodes.`)
        }

        if (hacknetRecruits.purchasedLevels > 0 || hacknetRecruits.purchasedRam > 0 || hacknetRecruits.purchasedCores > 0) {
            upgrades.push(`Upgraded nodes with`)
            let nodeUpgrades = []

            if (hacknetRecruits.purchasedLevels > 0) nodeUpgrades.push(`${hacknetRecruits.purchasedLevels} levels`)
            if (hacknetRecruits.purchasedRam > 0) nodeUpgrades.push(`${hacknetRecruits.purchasedRam} RAM upgrades`)
            if (hacknetRecruits.purchasedCores > 0) nodeUpgrades.push(`${hacknetRecruits.purchasedCores} cores`)

            upgrades.push(nodeUpgrades.join(', ') + ".")
        }

        ns.toast(upgrades.join(" "))
    } else {
        ns.toast(`[[ ATLACH-NACHA ]] >> Growing the cult hacknet is too expensive`, "warning")
    }
}
