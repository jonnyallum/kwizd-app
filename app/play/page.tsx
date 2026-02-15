'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { joinGame, useGameSync, submitAnswer } from '@/lib/useGameSync'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Check, X, ChevronUp } from 'lucide-react'

interface Question {
    id: string
    text: string
    options: string[]
    answer: string
}

const OPTION_COLORS = [
    { bg: 'bg-red-500', hover: 'hover:bg-red-400', ring: 'ring-red-400', text: 'text-red-500' },
    { bg: 'bg-blue-500', hover: 'hover:bg-blue-400', ring: 'ring-blue-400', text: 'text-blue-500' },
    { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-400', ring: 'ring-yellow-400', text: 'text-yellow-500' },
    { bg: 'bg-green-500', hover: 'hover:bg-green-400', ring: 'ring-green-400', text: 'text-green-500' },
]

const OPTION_LABELS = ['A', 'B', 'C', 'D']

function PlayerInterfaceContent() {
    const searchParams = useSearchParams()
    const urlPin = searchParams.get('pin')

    const [teamName, setTeamName] = useState('')
    const [manualPin, setManualPin] = useState('')
    const [gameId, setGameId] = useState<string | null>(null)
    const [playerId, setPlayerId] = useState<string | null>(null)
    const [joining, setJoining] = useState(false)
    const [joinError, setJoinError] = useState<string | null>(null)

    // Answer state
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [answerResult, setAnswerResult] = useState<{ isCorrect: boolean; pointsEarned: number } | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [timeLeft, setTimeLeft] = useState(20)
    const [questionStartTime, setQuestionStartTime] = useState<number | null>(null)
    const lastQuestionId = useRef<string | null>(null)

    const { game, players } = useGameSync(gameId)
    const activePin = urlPin || manualPin

    // Fetch question when current_question_id changes
    useEffect(() => {
        if (!game?.current_question_id || game.current_question_id === lastQuestionId.current) return

        lastQuestionId.current = game.current_question_id
        setSelectedAnswer(null)
        setAnswerResult(null)
        setSubmitting(false)
        setTimeLeft(20)
        setQuestionStartTime(performance.now())

        const fetchQuestion = async () => {
            const { data, error } = await supabase
                .from('questions')
                .select('id, text, options, answer')
                .eq('id', game.current_question_id!)
                .single()

            if (!error && data) {
                setCurrentQuestion({
                    id: data.id,
                    text: data.text,
                    options: data.options || [],
                    answer: data.answer,
                })
            }
        }
        fetchQuestion()
    }, [game?.current_question_id])

    // Countdown timer sync with host
    useEffect(() => {
        if (!game?.current_question_id || selectedAnswer || game?.status !== 'active' || !game?.question_started_at) return

        const updateTimer = () => {
            const startedAt = new Date(game.question_started_at!).getTime()
            const now = Date.now()
            const elapsed = Math.floor((now - startedAt) / 1000)
            const remaining = Math.max(0, 20 - elapsed)

            setTimeLeft(remaining)

            if (remaining <= 0) {
                handleTimeUp()
            }
        }

        updateTimer() // Initial sync
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [game?.current_question_id, game?.question_started_at, selectedAnswer, game?.status])

    async function handleJoin(e: React.FormEvent) {
        e.preventDefault()
        if (!activePin || !teamName.trim()) return

        setJoining(true)
        setJoinError(null)
        try {
            const { gameId: gId, playerId: pId } = await joinGame(activePin, teamName.trim())
            setGameId(gId)
            setPlayerId(pId)
        } catch (error) {
            setJoinError(error instanceof Error ? error.message : 'Failed to join. Check your PIN.')
        } finally {
            setJoining(false)
        }
    }

    async function handleSelectAnswer(answer: string) {
        if (!gameId || !playerId || !game?.current_question_id || selectedAnswer || submitting) return

        const speedMs = questionStartTime ? Math.round(performance.now() - questionStartTime) : 5000
        setSelectedAnswer(answer)
        setSubmitting(true)

        try {
            const result = await submitAnswer(gameId, playerId, game.current_question_id, answer, speedMs)
            setAnswerResult(result)
        } catch (error) {
            console.error('Answer submit error:', error)
            setAnswerResult({ isCorrect: false, pointsEarned: 0 })
        } finally {
            setSubmitting(false)
        }
    }

    function handleTimeUp() {
        if (selectedAnswer) return
        setSelectedAnswer('__TIMEOUT__')
        setAnswerResult({ isCorrect: false, pointsEarned: 0 })
    }

    const myPlayer = players.find((p) => p.id === playerId)
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
    const myIndex = sortedPlayers.findIndex((p) => p.id === playerId)
    const myRank = myIndex !== -1 ? myIndex + 1 : null

    // ─── JOIN SCREEN ───
    if (!gameId) {
        return (
            <div className="min-h-screen bg-obsidian flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-electric-purple/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-neon-cyan/10 blur-[150px] rounded-full" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md relative z-10"
                >
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-5xl font-black text-white mb-2 uppercase italic tracking-tighter">
                            Join <span className="text-gradient">Quiz</span>
                        </h1>
                        <p className="text-white/30 text-[10px] sm:text-xs uppercase tracking-[0.3em]">No app needed. Just play.</p>
                        {urlPin && (
                            <div className="inline-block glass-dark px-6 py-2 rounded-full border border-white/10 mt-4">
                                <p className="text-white/60 text-sm uppercase tracking-widest">
                                    PIN: <span className="text-neon-cyan font-black">{urlPin}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleJoin} className="glass-dark p-8 rounded-[2rem] border border-white/5">
                        {!urlPin && (
                            <div className="mb-6">
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Game PIN</p>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={manualPin}
                                    onChange={(e) => setManualPin(e.target.value.replace(/\D/g, ''))}
                                    placeholder="0000"
                                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-5 text-white text-4xl text-center font-black placeholder-white/10 focus:border-neon-cyan focus:outline-none transition-all tracking-[0.5em]"
                                    maxLength={4}
                                    required
                                />
                            </div>
                        )}

                        <div className="mb-8">
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Team Name</p>
                            <input
                                type="text"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="Enter your team name"
                                className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-5 text-white text-xl font-bold placeholder-white/10 focus:border-electric-purple focus:outline-none transition-all"
                                maxLength={30}
                                required
                            />
                        </div>

                        {joinError && (
                            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                <p className="text-red-400 text-sm font-bold">{joinError}</p>
                            </div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={joining || !teamName.trim() || !activePin}
                            className="w-full bg-white text-obsidian text-xl font-black py-5 rounded-2xl shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:bg-neon-cyan transition-all disabled:opacity-20 uppercase"
                        >
                            {joining ? 'Joining...' : 'Join Game'}
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        )
    }

    // ─── LOBBY SCREEN ───
    if (game?.status === 'lobby') {
        return (
            <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(157,29,242,0.05)_0%,transparent_70%)]" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center relative z-10"
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                        className="w-28 h-28 bg-gradient-to-br from-electric-purple to-neon-cyan rounded-[2rem] mx-auto mb-8 flex items-center justify-center shadow-[0_0_50px_rgba(157,29,242,0.3)]"
                    >
                        <Trophy className="w-14 h-14 text-white" />
                    </motion.div>

                    <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 uppercase italic tracking-tighter">
                        You&apos;re In!
                    </h1>
                    <p className="text-xl sm:text-2xl text-neon-cyan font-black mb-2 uppercase tracking-tight">{teamName}</p>
                    <p className="text-white/20 text-xs font-black uppercase tracking-[0.3em] mb-10">
                        Waiting for host to start...
                    </p>

                    <div className="glass-dark px-10 py-6 rounded-[2rem] border border-white/5 inline-block">
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Players Joined</p>
                        <p className="text-5xl font-black text-white">{players.length}</p>
                    </div>
                </motion.div>
            </div>
        )
    }

    // ─── ACTIVE GAME — ANSWER SELECTION ───
    if (game?.status === 'active') {
        // Waiting for next question
        if (!currentQuestion || !game.current_question_id) {
            return (
                <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-6">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16 border-4 border-white/10 border-t-neon-cyan rounded-full mb-6"
                    />
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Next question loading...</p>
                </div>
            )
        }

        return (
            <div className="min-h-screen bg-obsidian flex flex-col relative overflow-hidden">
                {/* Header: Score + Rank */}
                <div className="flex items-center justify-between p-4 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/5 px-4 py-2 rounded-xl">
                            <p className="text-white font-black text-sm">{teamName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-neon-cyan/10 px-3 py-2 rounded-xl">
                            <p className="text-neon-cyan font-black text-sm">#{myRank || '—'}</p>
                        </div>
                        <div className="bg-electric-purple/10 px-3 py-2 rounded-xl">
                            <p className="text-electric-purple font-black text-sm">{myPlayer?.score || 0} pts</p>
                        </div>
                    </div>
                </div>

                {/* Timer Bar */}
                {!selectedAnswer && (
                    <div className="px-4 relative z-10">
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${timeLeft > 10 ? 'bg-neon-cyan' : timeLeft > 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                initial={{ width: '100%' }}
                                animate={{ width: `${(timeLeft / 20) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <p className="text-center text-white/30 text-xs font-bold mt-1">{timeLeft}s</p>
                    </div>
                )}

                {/* Answer Result Feedback */}
                <AnimatePresence>
                    {answerResult && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="px-4 mt-2 relative z-10"
                        >
                            <div
                                className={`p-4 rounded-2xl text-center ${answerResult.isCorrect
                                    ? 'bg-green-500/20 border border-green-500/30'
                                    : 'bg-red-500/20 border border-red-500/30'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    {answerResult.isCorrect ? (
                                        <Check className="w-6 h-6 text-green-400" />
                                    ) : (
                                        <X className="w-6 h-6 text-red-400" />
                                    )}
                                    <span
                                        className={`text-xl font-black ${answerResult.isCorrect ? 'text-green-400' : 'text-red-400'
                                            }`}
                                    >
                                        {answerResult.isCorrect ? 'Correct!' : selectedAnswer === '__TIMEOUT__' ? 'Time\'s Up!' : 'Wrong!'}
                                    </span>
                                </div>
                                {answerResult.pointsEarned > 0 && (
                                    <div className="flex items-center justify-center gap-1">
                                        <ChevronUp className="w-4 h-4 text-green-400" />
                                        <span className="text-green-400 font-black text-sm">+{answerResult.pointsEarned} pts</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Question Text Restoration */}
                <div className="px-6 py-8 relative z-10 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={currentQuestion.id}
                        className="text-xl sm:text-2xl font-bold text-white leading-tight"
                    >
                        {currentQuestion.text}
                    </motion.h2>
                </div>

                {/* Answer Options Grid */}
                <div className="flex-1 flex items-center justify-center p-4 relative z-10">
                    <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                        {currentQuestion.options.map((option, idx) => {
                            const color = OPTION_COLORS[idx] || OPTION_COLORS[0]
                            const isSelected = selectedAnswer === option
                            const isCorrectAnswer = answerResult && option === currentQuestion.answer
                            const isWrongSelection = answerResult && isSelected && !answerResult.isCorrect
                            const isDisabled = !!selectedAnswer || submitting

                            let buttonClass = `${color.bg} ${color.hover}`
                            if (isCorrectAnswer) buttonClass = 'bg-green-500 ring-4 ring-green-300'
                            else if (isWrongSelection) buttonClass = 'bg-red-500/50 ring-4 ring-red-400'
                            else if (answerResult && !isSelected) buttonClass = 'bg-white/5 opacity-40'

                            return (
                                <motion.button
                                    key={idx}
                                    whileTap={!isDisabled ? { scale: 0.95 } : undefined}
                                    onClick={() => handleSelectAnswer(option)}
                                    disabled={isDisabled}
                                    className={`relative rounded-2xl p-4 sm:p-5 min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center text-center transition-all ${buttonClass} ${isDisabled ? 'cursor-default' : 'cursor-pointer active:scale-95'
                                        }`}
                                >
                                    <span className="text-white/60 text-[10px] sm:text-xs font-black mb-1">{OPTION_LABELS[idx]}</span>
                                    <span className="text-white font-bold text-sm sm:text-base leading-tight">{option}</span>
                                    {isCorrectAnswer && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-2 right-2"
                                        >
                                            <Check className="w-6 h-6 text-white" />
                                        </motion.div>
                                    )}
                                    {isWrongSelection && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-2 right-2"
                                        >
                                            <X className="w-6 h-6 text-white" />
                                        </motion.div>
                                    )}
                                </motion.button>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    // ─── FINISHED SCREEN ───
    if (game?.status === 'finished') {
        const podiumColors = ['bg-yellow-400/20 border-yellow-400/30', 'bg-gray-300/20 border-gray-300/30', 'bg-amber-600/20 border-amber-600/30']
        const podiumText = ['text-yellow-400', 'text-gray-300', 'text-amber-400']
        const podiumLabels = ['🥇', '🥈', '🥉']

        return (
            <div className="min-h-screen bg-obsidian flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.1)_0%,transparent_70%)]" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center relative z-10 w-full max-w-sm"
                >
                    <motion.div
                        animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 4 }}
                        className="relative inline-block mb-8"
                    >
                        <div className="absolute inset-0 bg-neon-cyan/20 blur-2xl rounded-full" />
                        <Trophy className="w-24 h-24 text-neon-cyan relative z-10 drop-shadow-[0_0_30px_rgba(0,242,255,0.5)]" />
                    </motion.div>

                    <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 uppercase italic tracking-tighter">
                        Game <span className="text-gradient">Over</span>
                    </h1>
                    <p className="text-white/30 text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-8">Neural Session Terminated</p>

                    {/* Your Result */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="glass-dark p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-gradient mb-8 relative group overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-electric-purple/5 to-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-4">Your Final Rank</p>
                        <p className="text-6xl sm:text-8xl font-black text-white mb-4 tracking-tighter italic">
                            {myRank !== null ? (myRank <= 3 ? podiumLabels[myRank - 1] : `#${myRank}`) : '—'}
                        </p>
                        <p className="text-3xl sm:text-4xl font-black text-gradient">
                            {myPlayer?.score.toLocaleString() || 0} <span className="text-xs sm:text-sm italic uppercase ml-1">pts</span>
                        </p>
                    </motion.div>

                    {/* Top 5 Leaderboard */}
                    <div className="space-y-3 mb-10">
                        {sortedPlayers.slice(0, 5).map((player, idx) => (
                            <motion.div
                                key={player.id}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4 + (idx * 0.1) }}
                                className={`flex items-center justify-between p-4 rounded-2xl transition-all ${player.id === playerId
                                    ? 'bg-neon-cyan/20 border-2 border-neon-cyan/30 shadow-[0_0_20px_rgba(0,242,255,0.1)]'
                                    : 'bg-white/5 border border-white/5 opacity-80'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`text-xl font-black italic ${idx < 3 ? podiumText[idx] : 'text-white/20'}`}>
                                        {idx + 1}
                                    </span>
                                    <span className="text-white font-bold text-sm uppercase tracking-tight">{player.team_name}</span>
                                </div>
                                <span className={`font-black text-sm ${player.id === playerId ? 'text-neon-cyan' : 'text-white/40'}`}>
                                    {player.score.toLocaleString()}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.location.reload()}
                        className="text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.5em] italic border-b border-white/5 pb-1"
                    >
                        [ Re-Enter Simulation ]
                    </motion.button>
                </motion.div>
            </div>
        )
    }

    return null
}

export default function PlayerInterface() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-obsidian flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-white/10 border-t-neon-cyan rounded-full animate-spin" />
                </div>
            }
        >
            <PlayerInterfaceContent />
        </Suspense>
    )
}
