'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Radio, Hand, CheckCircle2, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export default function PlayPage() {
    const [status, setStatus] = useState('lobby') // lobby, waiting, question, buzzed, result
    const [teamName, setTeamName] = useState('')
    const [hasJoint, setHasJoined] = useState(false)

    if (!hasJoint) {
        return (
            <main className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-8">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-electric-purple to-neon-cyan animate-pulse" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-sm"
                >
                    <h1 className="text-4xl font-black text-white text-center mb-2 tracking-tighter italic">KWIZZ</h1>
                    <p className="text-neon-cyan text-center text-xs tracking-[0.3em] font-bold mb-12 uppercase">Join the Arena</p>

                    <div className="space-y-6">
                        <div className="relative">
                            <p className="text-gray-500 text-[10px] font-black tracking-widest uppercase mb-2 ml-4">Enter Team Name</p>
                            <input
                                type="text"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="The Brainy Bunch..."
                                className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl text-white font-bold text-xl focus:border-neon-cyan/50 focus:outline-none transition-all placeholder:text-gray-700"
                            />
                        </div>

                        <button
                            onClick={() => setHasJoined(true)}
                            className="w-full bg-white text-obsidian p-6 rounded-3xl font-black text-xl shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 transition-all"
                        >
                            JOIN GAME
                        </button>
                    </div>
                </motion.div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-obsidian flex flex-col p-6 overflow-hidden select-none">
            {/* Top Info Bar */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
                        <Radio className="w-5 h-5 text-neon-cyan animate-pulse" />
                    </div>
                    <div>
                        <p className="text-white font-black text-sm tracking-tight">{teamName || 'Team Name'}</p>
                        <p className="text-neon-cyan text-[10px] font-bold tracking-widest uppercase">Connected</p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-gray-500 text-[10px] font-black tracking-widest uppercase">Points</p>
                    <p className="text-white font-black text-xl italic tracking-tighter">1,240 <span className="text-gray-600 font-medium">pts</span></p>
                </div>
            </div>

            {/* Dynamic Content */}
            <div className="flex-1 flex flex-col items-center justify-center gap-12">
                <AnimatePresence mode="wait">
                    {status === 'lobby' && (
                        <motion.div
                            key="lobby"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.2 }}
                            className="text-center"
                        >
                            <div className="w-32 h-32 glass rounded-full flex items-center justify-center mx-auto mb-8 border-neon-cyan/20">
                                <Users className="w-16 h-16 text-neon-cyan" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2 italic">WAITING FOR HOST</h2>
                            <p className="text-gray-500 text-sm tracking-widest uppercase font-medium">Get ready to buzz...</p>

                            <button
                                onClick={() => setStatus('question')}
                                className="mt-12 text-gray-700 hover:text-white transition-colors text-[10px] font-bold tracking-[0.2em] uppercase"
                            >
                                (Dev Bypass) START QUESTION
                            </button>
                        </motion.div>
                    )}

                    {status === 'question' && (
                        <motion.div
                            key="question"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full flex flex-col gap-12"
                        >
                            <div className="text-center">
                                <p className="text-neon-cyan text-xs font-black tracking-[0.4em] uppercase mb-4">Question Live</p>
                                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: "100%" }}
                                        animate={{ width: "0%" }}
                                        transition={{ duration: 15, ease: "linear" }}
                                        className="h-full bg-neon-cyan shadow-[0_0_10px_#00f2ff]"
                                    />
                                </div>
                            </div>

                            {/* THE BIG BUZZER */}
                            <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={() => setStatus('buzzed')}
                                className="w-64 h-64 mx-auto rounded-full bg-gradient-to-br from-electric-purple to-[#6d12ad] shadow-[0_30px_60px_rgba(157,29,242,0.4),inset_0_-10px_20px_rgba(0,0,0,0.3)] border-[8px] border-white/10 flex items-center justify-center relative group"
                            >
                                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-active:opacity-20 transition-opacity" />
                                <Zap className="w-32 h-32 text-white fill-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                            </motion.button>

                            <p className="text-gray-500 text-center text-xs font-black tracking-widest uppercase">Bazz as fast as you can!</p>
                        </motion.div>
                    )}

                    {status === 'buzzed' && (
                        <motion.div
                            key="buzzed"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="w-48 h-48 rounded-3xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center mx-auto mb-8">
                                <Hand className="w-24 h-24 text-neon-cyan" />
                            </div>
                            <h2 className="text-4xl font-black text-white mb-2 italic">BUZZED IN!</h2>
                            <p className="text-neon-cyan text-sm tracking-widest uppercase font-black">Waiting for your turn...</p>

                            <button
                                onClick={() => setStatus('lobby')}
                                className="mt-12 text-gray-700 hover:text-white transition-colors text-[10px] font-bold tracking-[0.2em] uppercase underline"
                            >
                                Reset Lobby
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Branding */}
            <div className="pt-8 text-center opacity-10">
                <p className="text-[8px] tracking-[1em] text-white uppercase italic">KWIZZ ARENA 3.0</p>
            </div>
        </main>
    )
}
