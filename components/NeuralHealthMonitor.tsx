'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Signal, Zap } from 'lucide-react'
import { Telemetry, type LogEntry, type MetricEntry } from '@/lib/telemetry'

export function NeuralHealthMonitor({ gameId }: { gameId: string | null }) {
    const [lastLog, setLastLog] = useState<LogEntry | null>(null)
    const [latency, setLatency] = useState<number | null>(null)
    const [status, setStatus] = useState<'nominal' | 'degraded' | 'critical'>('nominal')

    useEffect(() => {
        const interval = setInterval(() => {
            const logs = Telemetry.getLogs()
            const metrics = Telemetry.getMetrics('sync_latency')

            if (logs.length > 0) {
                setLastLog(logs[logs.length - 1])
            }

            if (metrics.length > 0) {
                const lastLat = metrics[metrics.length - 1].value
                setLatency(lastLat)

                if (lastLat > 500) setStatus('degraded')
                else if (lastLat > 1000) setStatus('critical')
                else setStatus('nominal')
            }
        }, 2000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="glass-dark border border-white/5 rounded-2xl p-4 flex items-center gap-4">
            <div className={`p-2 rounded-lg ${status === 'nominal' ? 'bg-neon-cyan/10 text-neon-cyan' :
                    status === 'degraded' ? 'bg-electric-purple/10 text-electric-purple' :
                        'bg-red-500/10 text-red-500'
                }`}>
                <Activity className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Neural Health</p>
                    <div className={`w-1 h-1 rounded-full animate-pulse ${status === 'nominal' ? 'bg-neon-cyan' :
                            status === 'degraded' ? 'bg-electric-purple' :
                                'bg-red-500'
                        }`} />
                </div>
                <div className="flex items-baseline gap-2">
                    <p className="text-white font-black text-sm tabular-nums">
                        {latency ? `${latency}ms` : 'Syncing...'}
                    </p>
                    <p className="text-[8px] font-bold text-white/20 uppercase truncate">
                        {lastLog ? lastLog.message : 'Waiting for telemetry...'}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-1 items-end">
                <Signal className={`w-3 h-3 ${latency && latency < 300 ? 'text-neon-cyan' : 'text-white/10'}`} />
                <Zap className={`w-3 h-3 ${status === 'nominal' ? 'text-neon-cyan' : 'text-white/10'}`} />
            </div>
        </div>
    )
}
