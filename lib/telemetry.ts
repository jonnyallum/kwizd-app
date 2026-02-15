export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL'

export interface LogEntry {
    timestamp: string
    level: LogLevel
    message: string
    context?: any
}

export interface MetricEntry {
    name: string
    value: number
    unit?: string
    timestamp: string
}

class TelemetrySystem {
    private logs: LogEntry[] = []
    private metrics: MetricEntry[] = []
    private readonly MAX_LOGS = 100

    log(level: LogLevel, message: string, context?: any) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context
        }
        this.logs.push(entry)
        if (this.logs.length > this.MAX_LOGS) {
            this.logs.shift()
        }

        if (typeof window !== 'undefined') {
            const style = level === 'ERROR' || level === 'CRITICAL' ? 'color: #f43f5e; font-weight: bold' : 'color: #00f2ff'
            console.log(`%c[Telemetry:${level}] ${message}`, style, context || '')
        }
    }

    trackMetric(name: string, value: number, unit?: string) {
        const entry: MetricEntry = {
            name,
            value,
            unit,
            timestamp: new Date().toISOString()
        }
        this.metrics.push(entry)
        if (this.metrics.length > this.MAX_LOGS) {
            this.metrics.shift()
        }
    }

    getLogs() {
        return this.logs
    }

    getMetrics(name?: string) {
        if (name) {
            return this.metrics.filter(m => m.name === name)
        }
        return this.metrics
    }
}

// Singleton instance
export const Telemetry = new TelemetrySystem()
