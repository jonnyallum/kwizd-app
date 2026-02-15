'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useGameSync, setCurrentQuestion, updateGameStatus } from '@/lib/useGameSync'
import { supabase } from '@/lib/supabase'
import { Users, Trophy, Clock } from 'lucide-react'
import QRCode from 'react-qr-code'

interface Question {
    id: string
    text: string
    type: string
    options: string[]
    answer: string
    fact: string
    difficulty: string
    question_order: number
}

import { motion, AnimatePresence } from 'framer-motion'

function HostDashboardContent() {
    const searchParams = useSearchParams()
    const gameId = searchParams.get('id')
    const pin = searchParams.get('pin')

    const { game, setGame, players, responses, loading } = useGameSync(gameId)
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [countdown, setCountdown] = useState(10)
    const [showingAnswer, setShowingAnswer] = useState(false)

    useEffect(() => {
        if (game?.quiz_id) {
            console.log('[Kwizz] Game loaded, quiz_id:', game.quiz_id)
            loadQuestions(game.quiz_id)
        }
    }, [game?.quiz_id])

    async function loadQuestions(quizId: string) {
        console.log('[Kwizz] Loading questions for quiz:', quizId)
        try {
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .eq('quiz_id', quizId)
                .order('question_order')

            if (error) {
                console.error('[Kwizz] Error loading questions:', error)
                return
            }
            console.log('[Kwizz] Loaded', data?.length, 'questions')
            setQuestions(data || [])
        } catch (err) {
            console.error('[Kwizz] Exception loading questions:', err)
        }
    }

    async function startGame() {
        if (!gameId) {
            console.error('[Kwizz] No gameId!')
            return
        }
        if (questions.length === 0) {
            console.error('[Kwizz] No questions loaded!')
            alert('Questions are still loading. Please wait a moment and try again.')
            return
        }
        try {
            console.log('[Kwizz] Starting game...', gameId, 'with', questions.length, 'questions')

            // Optimistically update local state FIRST so UI transitions immediately
            setGame(prev => prev ? { ...prev, status: 'active' as const, current_question_id: questions[0].id, question_started_at: new Date().toISOString() } : prev)
            setCurrentQuestionIndex(0)
            setCountdown(20)

            // Then persist to DB (fire and forget with error handling)
            await updateGameStatus(gameId, 'active')
            await setCurrentQuestion(gameId, questions[0].id)
            console.log('[Kwizz] Game started successfully!')
        } catch (err) {
            console.error('[Kwizz] Error starting game:', err)
            // Revert optimistic update on failure
            setGame(prev => prev ? { ...prev, status: 'lobby' as const, current_question_id: null } : prev)
            alert('Failed to start game. Please try again.')
        }
    }

    async function nextQuestion() {
        const nextIndex = currentQuestionIndex + 1
        if (nextIndex < questions.length && gameId) {
            console.log('[Kwizz] Advancing to question:', nextIndex + 1)
            // Optimistic update
            setCurrentQuestionIndex(nextIndex)
            setGame(prev => prev ? { ...prev, current_question_id: questions[nextIndex].id, question_started_at: new Date().toISOString() } : prev)
            setShowingAnswer(false)
            setCountdown(20) // Reset to 20 for gameplay

            try {
                await setCurrentQuestion(gameId, questions[nextIndex].id)
            } catch (err) {
                console.error('[Kwizz] Error advancing question:', err)
            }
        } else if (gameId) {
            console.log('[Kwizz] Finishing game...')
            // Optimistic update to finished
            setGame(prev => prev ? { ...prev, status: 'finished' as const } : prev)

            try {
                await updateGameStatus(gameId, 'finished')
            } catch (err) {
                console.error('[Kwizz] Error finishing game:', err)
            }
        } else {
            console.warn('[Kwizz] Cannot advance: nextIndex out of bounds or no gameId', { nextIndex, length: questions.length, gameId })
        }
    }

    // Auto-reveal answer when countdown hits zero
    useEffect(() => {
        if (game?.status === 'active' && countdown === 0 && !showingAnswer) {
            console.log('[Kwizz] Countdown reached zero, showing answer...')
            setShowingAnswer(true)
        }
    }, [countdown, game?.status, showingAnswer])

    useEffect(() => {
        if (game?.status === 'active' && countdown > 0 && !showingAnswer) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown, game?.status, showingAnswer])

    const currentQuestion = questions[currentQuestionIndex]
    const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/play/?pin=${pin}` : ''

    // Loading View
    if (loading || !gameId) {
        return (
            <div className="min-h-screen bg-obsidian flex items-center justify-center">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-center"
                >
                    <p className="text-white font-black uppercase tracking-[0.5em]">Syncing Intelligence...</p>
                </motion.div>
            </div>
        )
    }

    // Lobby View
    if (game?.status === 'lobby') {
        return (
            <div className="min-h-screen bg-obsidian p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-electric-purple/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-neon-cyan/10 blur-[120px] rounded-full" />

                <div className="max-w-6xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-5xl sm:text-8xl font-black text-white mb-6 tracking-tighter italic uppercase">
                            The <span className="text-gradient">Lobby</span>
                        </h1>
                        <div className="inline-block relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-electric-purple to-neon-cyan blur-2xl opacity-20" />
                            <div className="relative glass-dark px-8 sm:px-16 py-6 sm:py-10 rounded-2xl sm:rounded-[2.5rem] border-gradient">
                                <p className="text-white/40 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] mb-4">Frequency PIN</p>
                                <p className="text-6xl sm:text-9xl font-black text-white tracking-[0.2em]">{pin}</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                        {/* QR Code */}
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="glass-dark p-12 rounded-[3rem] border-gradient text-center"
                        >
                            <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-widest">Neural Link</h3>
                            <div className="bg-white p-8 rounded-[2rem] inline-block shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                                <QRCode value={joinUrl} size={250} />
                            </div>
                            <p className="text-white/20 font-mono text-xs mt-8 truncate max-w-xs mx-auto italic">{joinUrl}</p>
                        </motion.div>

                        {/* Player Count */}
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="glass-dark p-12 rounded-[3rem] border-gradient"
                        >
                            <div className="flex items-center gap-4 sm:gap-6 mb-8">
                                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-neon-cyan" />
                                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-widest">Active Nodes</h3>
                            </div>
                            <p className="text-7xl sm:text-9xl font-black text-gradient mb-8">{players.length}</p>
                            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-4 scrollbar-hide">
                                <AnimatePresence>
                                    {players.map((player) => (
                                        <motion.div
                                            key={player.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5"
                                        >
                                            <p className="text-white font-bold truncate text-sm">{player.team_name}</p>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={startGame}
                        disabled={players.length === 0 || questions.length === 0}
                        className="w-full bg-white text-obsidian text-3xl font-black py-8 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:bg-neon-cyan transition-all disabled:opacity-20 uppercase italic tracking-tighter"
                    >
                        {questions.length === 0 ? 'Loading Neural Packs...' : `Engage Engine (${players.length} Players)`}
                    </motion.button>
                </div>
            </div>
        )
    }

    // Active Game View
    if (game?.status === 'active' && currentQuestion) {
        const questionResponses = responses.filter(r => r.question_id === currentQuestion.id)
        const sortedResponses = [...questionResponses].sort((a, b) => a.speed_ms - b.speed_ms)

        return (
            <div className="min-h-screen bg-obsidian p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Question Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6 md:mb-8">
                        <div className="flex items-center gap-3">
                            <div className="bg-electric-purple/20 px-4 md:px-6 py-2 md:py-3 rounded-xl">
                                <p className="text-white font-bold text-sm md:text-base">
                                    Q{currentQuestionIndex + 1}/{questions.length}
                                </p>
                            </div>
                            <div className="bg-neon-cyan/20 px-4 md:px-6 py-2 md:py-3 rounded-xl">
                                <p className="text-white font-bold capitalize text-sm md:text-base">{currentQuestion.difficulty}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 px-4 md:px-6 py-2 md:py-3 rounded-xl">
                            <Clock className="w-5 h-5 md:w-6 md:h-6 text-neon-cyan" />
                            <span className="text-2xl md:text-3xl font-bold text-white">{countdown}s</span>
                        </div>
                    </div>

                    {/* Question */}
                    <div className="glass-card p-6 md:p-12 mb-6 md:mb-8">
                        <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 md:mb-8">{currentQuestion.text}</h2>
                        {currentQuestion.options && currentQuestion.options.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                {currentQuestion.options.map((option, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-6 rounded-xl text-xl font-bold transition-all ${showingAnswer && option === currentQuestion.answer
                                            ? 'bg-green-500 text-white'
                                            : 'bg-white/10 text-white'
                                            }`}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Responses */}
                    <div className="glass-card p-8 mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <Trophy className="w-8 h-8 text-electric-purple" />
                            <h3 className="text-2xl font-bold text-white">
                                Responses ({questionResponses.length}/{players.length})
                            </h3>
                        </div>
                        <div className="space-y-2">
                            {sortedResponses.slice(0, 5).map((response, idx) => {
                                const player = players.find(p => p.id === response.player_id)
                                if (!player) return null
                                return (
                                    <div key={response.id} className="flex items-center justify-between bg-white/5 px-6 py-4 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl font-bold text-electric-purple">#{idx + 1}</span>
                                            <span className="text-white font-medium">{player.team_name}</span>
                                        </div>
                                        <span className="text-neon-cyan font-mono">{response.speed_ms}ms</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-4">
                        {!showingAnswer && (
                            <button
                                onClick={() => setShowingAnswer(true)}
                                className="flex-1 bg-gradient-to-r from-electric-purple to-neon-cyan text-white text-xl font-bold py-4 rounded-xl hover:shadow-glow-purple transition-all"
                            >
                                Show Answer
                            </button>
                        )}
                        {showingAnswer && (
                            <button
                                onClick={nextQuestion}
                                className="flex-1 bg-gradient-to-r from-electric-purple to-neon-cyan text-white text-xl font-bold py-4 rounded-xl hover:shadow-glow-purple transition-all"
                            >
                                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Game'}
                            </button>
                        )}
                    </div>

                    {showingAnswer && currentQuestion.fact && (
                        <div className="mt-8 glass-card p-6">
                            <p className="text-neon-cyan font-bold mb-2">Did you know?</p>
                            <p className="text-white/80">{currentQuestion.fact}</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Finished View
    if (game?.status === 'finished') {
        const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
        const podiumColors = ['border-yellow-400/50 shadow-yellow-400/20', 'border-gray-300/50 shadow-gray-300/20', 'border-orange-400/50 shadow-orange-400/20']
        const podiumText = ['text-yellow-400', 'text-gray-300', 'text-orange-400']

        return (
            <div className="min-h-screen bg-obsidian p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(157,29,242,0.1)_0%,transparent_70%)]" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mb-16"
                    >
                        <Trophy className="w-16 h-16 sm:w-24 sm:h-24 text-yellow-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
                        <h1 className="text-4xl sm:text-7xl font-black text-white uppercase italic tracking-tighter">
                            Final <span className="text-gradient">Standings</span>
                        </h1>
                    </motion.div>

                    <div className="space-y-4">
                        <AnimatePresence>
                            {sortedPlayers.map((player, idx) => (
                                <motion.div
                                    key={player.id}
                                    initial={{ x: idx % 2 === 0 ? -100 : 100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                                    className={`glass-card p-6 flex items-center justify-between border-2 transition-all duration-500 ${idx < 3 ? podiumColors[idx] : 'border-white/5 opacity-60'
                                        }`}
                                >
                                    <div className="flex items-center gap-8">
                                        <span className={`text-3xl sm:text-5xl font-black italic tracking-tighter ${idx < 3 ? podiumText[idx] : 'text-white/20'}`}>
                                            #{idx + 1}
                                        </span>
                                        <div className="text-left">
                                            <p className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em]">Neural Node</p>
                                            <p className="text-xl sm:text-3xl font-black text-white uppercase italic tracking-tight">{player.team_name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em]">Accumulated Intel</p>
                                        <p className={`text-2xl sm:text-4xl font-black ${idx === 0 ? 'text-neon-cyan drop-shadow-[0_0_10px_rgba(0,242,255,0.5)]' : 'text-white'}`}>
                                            {player.score.toLocaleString()} <span className="text-xs uppercase italic ml-1">pts</span>
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        onClick={() => window.location.href = '/'}
                        className="mt-16 text-white/20 hover:text-white transition-colors text-sm font-black uppercase tracking-[0.5em] italic"
                    >
                        [ Return to Command Center ]
                    </motion.button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-obsidian via-obsidian-light to-obsidian flex items-center justify-center">
            <p className="text-white/60">Loading game...</p>
        </div>
    )
}

export default function HostDashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-obsidian flex items-center justify-center text-white">Loading Host Dashboard...</div>}>
            <HostDashboardContent />
        </Suspense>
    )
}
