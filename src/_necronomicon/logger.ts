import { NS } from '../../NetscriptDefinitions';

export enum LogLevel {
    TRACE = -1,
    DEBUG = 0,
    INFO = 1,
    WARNING = 2,
    ERROR = 3,
    CRITICAL = 4,
    FATAL = 5
}

export class Logger {
    constructor(private ns: NS, private level: LogLevel = LogLevel.DEBUG) {
        this.start = performance.now()

        if (this.level >= LogLevel.WARNING) {
            this.info(`[[ SILENCING THE VOICES ]] -> ALL`)
            ns.disableLog("ALL")
        }
    }

    private start: number
    private get timestamp(): string {
        let dt = performance.now() - this.start
        let s = dt % (60 * 1000), m = (dt - s) / 60
        return this.ns.sprintf("%03d:%02.03f", m, s)
    }

    private get serviceName(): string {
        return this.ns.getScriptName().split("/").pop()?.split(".")[0] ?? "unknown"
    }

    private log(level: LogLevel, msg: string, ...args: any[]): void {
        if (level < this.level) return
        let fmsg = this.ns.sprintf(msg, ...args)
        this.ns.print(`[${LogLevel[level]} ${this.timestamp}] ${fmsg}`)
    }

    public trace(msg: string, ...args: any[]): void {
        this.log(LogLevel.TRACE, msg, ...args)
    }

    public debug(msg: string, ...args: any[]): void {
        this.log(LogLevel.DEBUG, msg, ...args)
    }

    public info(msg: string, ...args: any[]): void {
        this.log(LogLevel.INFO, msg, ...args)
    }

    public warn(msg: string, ...args: any[]): void {
        this.log(LogLevel.WARNING, msg, ...args)
    }

    public warning(msg: string, ...args: any[]): void {
        this.log(LogLevel.WARNING, msg, ...args)
    }

    public error(msg: string, ...args: any[]): void {
        this.log(LogLevel.ERROR, msg, ...args)
    }

    public critical(msg: string, ...args: any[]): void {
        this.log(LogLevel.CRITICAL, msg, ...args)
    }

    public fatal(msg: string, ...args: any[]): void {
        this.log(LogLevel.FATAL, msg, ...args)
    }


    /**
     * Create a toast notification with the given message
     *
     * @note Toasts are always shown even if the log level is supperior to the toast variant
     *
     * @param msg msg of the toast
     * @param variant style of the toast
     * @param args values used for sprintf in the msg
     */
    public toast(msg: string, variant: "success" | "info" | "warning" | "error" = "success", ...args: any[]): void {
        let level = variant === "success" || variant === "info" ? LogLevel.INFO : variant === "error" ? LogLevel.ERROR : LogLevel.WARNING
        this.log(level, msg, ...args)

        let fmsg = this.ns.sprintf(msg, ...args)
        this.ns.toast(`${fmsg} << [[ ${this.serviceName.toUpperCase()} ]]`, variant, 10000)
    }
}
