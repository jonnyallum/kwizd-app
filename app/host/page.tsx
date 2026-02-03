'use client'

import { motion } from 'framer-motion'
import { QrCode, Play, Users, Clock, Award, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

export default function HostPage() {
    const [gameState, setGameState] = useState('lobby') // lobby, question, results
    const [pin] = useState('8831')

    return (
        <main className="min-h-screen bg-obsidian flex flex-col p-8 md:p-12 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 relative">
                        <Image src="/logo.png" alt="Kwizz Logo" fill className="object-contain" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-widest">KWIZZ</h1>
                        <p className="text-neon-cyan text-xs font-bold tracking-[0.3em]">LIVE SESSION</p>
                    </div>
                </div>

                <div className="flex gap-8 items-center">
                    <div className="text-right">
                        <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Players Joined</p>
                        <div className="flex items-center justify-end gap-2 text-white font-black text-2xl">
                            <Users className="w-6 h-6 text-neon-cyan" />
                            <span>42</span>
                        </div>
                    </div>
                    <div className="h-10 w-[1px] bg-white/10" />
                    <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl">
                        <p className="text-gray-500 text-xs uppercase tracking-widest mb-1 text-center">Join Pin</p>
                        <p className="text-white font-black text-4xl tracking-widest">{pin}</p>
                    </div>
                </div>
            </div>

            {/* Main Display Area */}
            <div className="flex-1 flex gap-8">
                {/* Left Side: Active Content */}
                <div className="flex-[3] relative">
                    {gameState === 'lobby' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-full glass-dark rounded-[40px] flex flex-col items-center justify-center border border-white/5 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-electric-purple/5 to-transparent pointer-events-none" />

                            <div className="bg-white p-8 rounded-[30px] shadow-[0_0_100px_rgba(255,255,255,0.1)] mb-8">
                                <QrCode className="w-64 h-64 text-obsidian" />
                            </div>

                            <h2 className="text-5xl font-black text-white mb-4">SCAN TO JOIN</h2>
                            <p className="text-gray-400 text-xl tracking-widest font-light">
                                WWW.KWIZZ.CO.UK/PLAY
                            </p>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setGameState('question')}
                                className="mt-12 px-12 py-6 bg-neon-cyan text-obsidian font-black text-2xl rounded-2xl flex items-center gap-4 shadow-[0_0_50px_rgba(0,242,255,0.3)]"
                            >
                                START GAME
                                <ChevronRight className="w-8 h-8" />
                            </motion.button>
                        </motion.div>
                    )}

                    {gameState === 'question' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col"
                        >
                            <div className="flex-1 glass-dark rounded-[40px] p-16 flex flex-col justify-center border border-white/5 mb-8">
                                <div className="flex items-center gap-4 mb-8 text-neon-cyan">
                                    <span className="px-4 py-2 rounded-full border border-neon-cyan/30 text-xs font-black tracking-widest uppercase">Question 04 / 20</span>
                                    <span className="px-4 py-2 rounded-full border border-neon-cyan/30 text-xs font-black tracking-widest uppercase">History</span>
                                </div>

                                <h2 className="text-6xl font-black text-white leading-tight">
                                    In which year did the Great Fire of London occur?
                                </h2>

                                <div className="mt-16 grid grid-cols-2 gap-6">
                                    {['1666', '1664', '1668', '1670'].map((opt, i) => (
                                        <div key={i} className="p-8 rounded-3xl glass text-3xl font-bold text-white/80 border border-white/5 flex items-center gap-6">
                                            <span className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-neon-cyan">{String.fromCharCode(65 + i)}</span>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Question Footer */}
                            <div className="flex gap-8">
                                <div className="flex-1 glass-dark rounded-3xl p-6 flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-neon-cyan/10 flex items-center justify-center">
                                        <Clock className="w-8 h-8 text-neon-cyan" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs font-black tracking-widest uppercase mb-1">Time Remaining</p>
                                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-2">
                                            <motion.div
                                                initial={{ width: "100%" }}
                                                animate={{ width: "0%" }}
                                                transition={{ duration: 15, ease: "linear" }}
                                                className="h-full bg-neon-cyan"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 glass-dark rounded-3xl p-6 flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-electric-purple/10 flex items-center justify-center">
                                        <Award className="w-8 h-8 text-electric-purple" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs font-black tracking-widest uppercase mb-1">Responses</p>
                                        <p className="text-white font-black text-2xl tracking-widest">38 / 42</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right Side: Sidebar */}
                <div className="flex-1 flex flex-col gap-8">
                    {/* Leaderboard Fast-View */}
                    <div className="flex-1 glass-dark rounded-[40px] p-8 border border-white/5">
                        <h3 className="text-white font-black text-xl tracking-widest mb-8 border-b border-white/5 pb-4">LEADERBOARD</h3>
                        <div className="flex flex-col gap-4">
                            {[
                                { name: 'Quiz Richards', pts: '4,821', trend: 'up' },
                                { name: 'The Brainiacs', pts: '4,510', trend: 'up' },
                                { name: 'Smarty Pants', pts: '4,489', trend: 'down' },
                                { name: 'Know-it-alls', pts: '4,203', trend: 'stable' },
                                { name: 'Team Alpha', pts: '3,912', trend: 'up' }
                            ].map((team, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                                    <div className="flex items-center gap-4">
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-neon-cyan text-obsidian' : 'bg-white/10 text-white'}`}>
                                            {i + 1}
                                        </span>
                                        <span className="text-white font-bold">{team.name}</span>
                                    </div>
                                    <span className="text-neon-cyan font-black">{team.pts}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="h-48 glass-dark rounded-[40px] p-8 border border-white/5">
                        <div className="flex items-center gap-3 text-electric-purple mb-4">
                            <Zap className="w-5 h-5 fill-electric-purple" />
                            <h3 className="font-black text-xs tracking-[0.2em] uppercase">Buzzer Feed</h3>
                        </div>
                        <div className="space-y-2">
                            <p className="text-gray-400 text-xs font-medium"><span className="text-white">Team Alpha</span> buzzed in! <span className="text-gray-600 text-[10px] ml-2">1.2s</span></p>
                            <p className="text-gray-400 text-xs font-medium"><span className="text-white">Quiz Richards</span> buzzed in! <span className="text-gray-600 text-[10px] ml-2">1.5s</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
