'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
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

export default function HostDashboard() {
    const params = useParams()
    const searchParams = useSearchParams()
    const gameId = params.id as string
    const pin = searchParams.get('pin')

    const { game, players, responses, loading } = useGameSync(gameId)
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [countdown, setCountdown] = useState(10)
    const [showingAnswer, setShowingAnswer] = useState(false)

    useEffect(() => {
        if (game?.quiz_id) {
            loadQuestions(game.quiz_id)
        }
    }, [game?.quiz_id])

    async function loadQuestions(quizId: string) {
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('quiz_id', quizId)
            .order('question_order')

        if (!error && data) {
            setQuestions(data)
        }
    }

    async function startGame() {
        if (questions.length > 0) {
            await updateGameStatus(gameId, 'active')
            await setCurrentQuestion(gameId, questions[0].id)
            setCountdown(10)
        }
    }

    async function nextQuestion() {
        const nextIndex = currentQuestionIndex + 1
        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex)
            await setCurrentQuestion(gameId, questions[nextIndex].id)
            setShowingAnswer(false)
            setCountdown(10)
        } else {
            await updateGameStatus(gameId, 'finished')
        }
    }

    useEffect(() => {
        if (game?.status === 'active' && countdown > 0 && !showingAnswer) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown, game?.status, showingAnswer])

    const currentQuestion = questions[currentQuestionIndex]
    const joinUrl = `${window.location.origin}/play?pin=${pin}`

    // Lobby View
    if (game?.status === 'lobby') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-obsidian via-obsidian-light to-obsidian p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-6xl font-bold text-white mb-4">Game Lobby</h1>
                        <div className="inline-block bg-gradient-to-r from-electric-purple to-neon-cyan p-1 rounded-2xl">
                            <div className="bg-obsidian px-12 py-6 rounded-xl">
                                <p className="text-white/60 text-sm mb-2">Join PIN</p>
                                <p className="text-7xl font-bold text-white tracking-wider">{pin}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* QR Code */}
                        <div className="glass-card p-8 text-center">
                            <h3 className="text-2xl font-bold text-white mb-6">Scan to Join</h3>
                            <div className="bg-white p-6 rounded-xl inline-block">
                                <QRCode value={joinUrl} size={200} />
                            </div>
                            <p className="text-white/40 text-sm mt-4">{joinUrl}</p>
                        </div>

                        {/* Player Count */}
                        <div className="glass-card p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <Users className="w-8 h-8 text-neon-cyan" />
                                <h3 className="text-2xl font-bold text-white">Players Joined</h3>
                            </div>
                            <p className="text-6xl font-bold text-electric-purple mb-6">{players.length}</p>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {players.map((player) => (
                                    <div key={player.id} className="bg-white/5 px-4 py-2 rounded-lg">
                                        <p className="text-white font-medium">{player.team_name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={startGame}
                        disabled={players.length === 0 || questions.length === 0}
                        className="w-full bg-gradient-to-r from-electric-purple to-neon-cyan text-white text-2xl font-bold py-6 rounded-xl hover:shadow-glow-purple transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {questions.length === 0 ? 'Loading Questions...' : `Start Game (${players.length} Players)`}
                    </button>
                </div>
            </div>
        )
    }

    // Active Game View
    if (game?.status === 'active' && currentQuestion) {
        const questionResponses = responses.filter(r => r.question_id === currentQuestion.id)
        const sortedResponses = [...questionResponses].sort((a, b) => a.speed_ms - b.speed_ms)

        return (
            <div className="min-h-screen bg-gradient-to-br from-obsidian via-obsidian-light to-obsidian p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Question Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="bg-electric-purple/20 px-6 py-3 rounded-lg">
                                <p className="text-white font-bold">
                                    Question {currentQuestionIndex + 1} / {questions.length}
                                </p>
                            </div>
                            <div className="bg-neon-cyan/20 px-6 py-3 rounded-lg">
                                <p className="text-white font-bold capitalize">{currentQuestion.difficulty}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-lg">
                            <Clock className="w-6 h-6 text-neon-cyan" />
                            <span className="text-3xl font-bold text-white">{countdown}s</span>
                        </div>
                    </div>

                    {/* Question */}
                    <div className="glass-card p-12 mb-8">
                        <h2 className="text-4xl font-bold text-white mb-8">{currentQuestion.text}</h2>
                        {currentQuestion.type === 'multiple_choice' && (
                            <div className="grid grid-cols-2 gap-4">
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
                                return (
                                    <div key={response.id} className="flex items-center justify-between bg-white/5 px-6 py-4 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl font-bold text-electric-purple">#{idx + 1}</span>
                                            <span className="text-white font-medium">{player?.team_name}</span>
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

        return (
            <div className="min-h-screen bg-gradient-to-br from-obsidian via-obsidian-light to-obsidian p-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-6xl font-bold text-white mb-12">Final Leaderboard</h1>
                    <div className="space-y-4">
                        {sortedPlayers.map((player, idx) => (
                            <div
                                key={player.id}
                                className={`glass-card p-8 flex items-center justify-between ${idx === 0 ? 'ring-4 ring-electric-purple' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-6">
                                    <span className="text-4xl font-bold text-electric-purple">#{idx + 1}</span>
                                    <span className="text-2xl font-bold text-white">{player.team_name}</span>
                                </div>
                                <span className="text-3xl font-bold text-neon-cyan">{player.score} pts</span>
                            </div>
                        ))}
                    </div>
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
