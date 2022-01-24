export const $ = eval("window.docu" + "ment") as Document

export function props(e: Element): any {
    // @ts-ignore: React props
    return e[Object.keys(e)[1]] as any
}

export function click(e: Element) {
    props(e).onClick({ isTrusted: true })
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
    const handler: any = props(input)
    handler.onChange({ target: input })
    handler.onKeyDown({ keyCode: 13, preventDefault: () => null })
}