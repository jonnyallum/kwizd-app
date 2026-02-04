'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { joinGame, useGameSync, submitBuzzer } from '@/lib/useGameSync'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Trophy, Clock } from 'lucide-react'

function PlayerInterfaceContent() {
    const searchParams = useSearchParams()
    const urlPin = searchParams.get('pin')

    const [teamName, setTeamName] = useState('')
    const [manualPin, setManualPin] = useState('')
    const [gameId, setGameId] = useState<string | null>(null)
    const [playerId, setPlayerId] = useState<string | null>(null)
    const [joining, setJoining] = useState(false)
    const [buzzerPressed, setBuzzerPressed] = useState(false)
    const [buzzerTime, setBuzzerTime] = useState<number | null>(null)

    const { game, players } = useGameSync(gameId)

    // Use URL pin if available, otherwise manual pin
    const activePin = urlPin || manualPin

    async function handleJoin(e: React.FormEvent) {
        e.preventDefault()
        if (!activePin || !teamName.trim()) return

        setJoining(true)
        try {
            const { gameId: gId, playerId: pId } = await joinGame(activePin, teamName.trim())
            setGameId(gId)
            setPlayerId(pId)
        } catch (error) {
            alert('Failed to join game. Check your PIN and try again.')
        } finally {
            setJoining(false)
        }
    }

    async function handleBuzzer() {
        if (!gameId || !playerId || !game?.current_question_id || buzzerPressed) return

        const pressTime = Date.now()
        setBuzzerPressed(true)
        setBuzzerTime(pressTime)

        try {
            // Calculate speed from question start (simplified - in production track actual question start time)
            const speedMs = Math.floor(Math.random() * 3000) // Placeholder - replace with actual timing
            await submitBuzzer(gameId, playerId, game.current_question_id, speedMs)
        } catch (error) {
            console.error('Buzzer error:', error)
            setBuzzerPressed(false)
        }
    }

    // Reset buzzer when new question appears
    useEffect(() => {
        if (game?.current_question_id) {
            setBuzzerPressed(false)
            setBuzzerTime(null)
        }
    }, [game?.current_question_id])

    const myPlayer = players.find(p => p.id === playerId)
    const myRank = players
        .sort((a, b) => b.score - a.score)
        .findIndex(p => p.id === playerId) + 1

    // Join Screen
    if (!gameId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-obsidian via-obsidian-light to-obsidian flex items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md"
                >
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-bold text-white mb-4">Join Game</h1>
                        {urlPin && <p className="text-white/60 text-xl">PIN: <span className="text-neon-cyan font-bold">{urlPin}</span></p>}
                    </div>

                    <form onSubmit={handleJoin} className="glass-card p-8">
                        {/* PIN Input - Only show if not in URL */}
                        {!urlPin && (
                            <label className="block mb-6">
                                <span className="text-white font-bold mb-2 block">Game PIN</span>
                                <input
                                    type="text"
                                    value={manualPin}
                                    onChange={(e) => setManualPin(e.target.value)}
                                    placeholder="Enter 4-digit PIN"
                                    className="w-full bg-white/10 border-2 border-white/20 rounded-lg px-6 py-4 text-white text-xl placeholder-white/40 focus:border-electric-purple focus:outline-none transition-colors text-center font-mono tracking-widest"
                                    maxLength={4}
                                    required
                                />
                            </label>
                        )}

                        <label className="block mb-6">
                            <span className="text-white font-bold mb-2 block">Team Name</span>
                            <input
                                type="text"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="Enter your team name"
                                className="w-full bg-white/10 border-2 border-white/20 rounded-lg px-6 py-4 text-white text-xl placeholder-white/40 focus:border-electric-purple focus:outline-none transition-colors"
                                maxLength={30}
                                required
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={joining || !teamName.trim() || !activePin}
                            className="w-full bg-gradient-to-r from-electric-purple to-neon-cyan text-white text-xl font-bold py-4 rounded-lg hover:shadow-glow-purple transition-all disabled:opacity-50"
                        >
                            {joining ? 'Joining...' : 'Join Game'}
                        </button>
                    </form>
                </motion.div>
            </div>
        )
    }

    // Lobby Screen
    if (game?.status === 'lobby') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-obsidian via-obsidian-light to-obsidian flex flex-col items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                >
                    <div className="mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-electric-purple to-neon-cyan rounded-full mx-auto mb-6 flex items-center justify-center">
                            <Trophy className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">You're In!</h1>
                        <p className="text-2xl text-electric-purple font-bold mb-2">{teamName}</p>
                        <p className="text-white/60">Waiting for host to start the game...</p>
                    </div>

                    <div className="glass-card p-6 inline-block">
                        <p className="text-white/60 text-sm mb-2">Players Joined</p>
                        <p className="text-5xl font-bold text-neon-cyan">{players.length}</p>
                    </div>

                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="mt-8"
                    >
                        <div className="w-16 h-16 border-4 border-electric-purple border-t-transparent rounded-full animate-spin mx-auto" />
                    </motion.div>
                </motion.div>
            </div>
        )
    }

    // Active Game - Buzzer Screen
    if (game?.status === 'active') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-obsidian via-obsidian-light to-obsidian flex flex-col p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="glass-card px-4 py-2">
                        <p className="text-white font-bold">{teamName}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="glass-card px-4 py-2">
                            <p className="text-neon-cyan font-bold">Rank #{myRank}</p>
                        </div>
                        <div className="glass-card px-4 py-2">
                            <p className="text-electric-purple font-bold">{myPlayer?.score || 0} pts</p>
                        </div>
                    </div>
                </div>

                {/* Buzzer */}
                <div className="flex-1 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {!buzzerPressed ? (
                            <motion.button
                                key="buzzer"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleBuzzer}
                                className="relative w-80 h-80 rounded-full bg-gradient-to-br from-electric-purple via-neon-cyan to-electric-purple shadow-2xl shadow-electric-purple/50 active:shadow-glow-purple transition-all"
                            >
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 2
                                    }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <Zap className="w-32 h-32 text-white drop-shadow-glow" />
                                </motion.div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-4xl font-bold text-white mt-32">BUZZ!</span>
                                </div>
                            </motion.button>
                        ) : (
                            <motion.div
                                key="buzzed"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-32 h-32 border-8 border-electric-purple border-t-transparent rounded-full mx-auto mb-8"
                                />
                                <h2 className="text-4xl font-bold text-white mb-4">Buzzed In!</h2>
                                <p className="text-white/60 text-xl">Waiting for results...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Instructions */}
                {!buzzerPressed && (
                    <div className="text-center">
                        <p className="text-white/60 text-lg">
                            Tap the buzzer as fast as you can when you know the answer!
                        </p>
                    </div>
                )}
            </div>
        )
    }

    // Finished Screen
    if (game?.status === 'finished') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-obsidian via-obsidian-light to-obsidian flex items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                >
                    <Trophy className="w-24 h-24 text-electric-purple mx-auto mb-6" />
                    <h1 className="text-5xl font-bold text-white mb-4">Game Over!</h1>
                    <div className="glass-card p-8 mb-6">
                        <p className="text-white/60 mb-2">Your Final Rank</p>
                        <p className="text-6xl font-bold text-electric-purple mb-4">#{myRank}</p>
                        <p className="text-3xl font-bold text-neon-cyan">{myPlayer?.score || 0} points</p>
                    </div>
                    <p className="text-white/60 text-lg">Thanks for playing!</p>
                </motion.div>
            </div>
        )
    }

    return null
}

export default function PlayerInterface() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-obsidian flex items-center justify-center text-white">Loading...</div>}>
            <PlayerInterfaceContent />
        </Suspense>
    )
}
