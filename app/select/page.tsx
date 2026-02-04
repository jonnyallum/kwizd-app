'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { createGame } from '@/lib/useGameSync'
import { useRouter } from 'next/navigation'
import { Sparkles, ChevronRight } from 'lucide-react'

interface Quiz {
    id: string
    title: string
    category: string
    created_at: string
}

export default function QuizSelector() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const router = useRouter()

    useEffect(() => {
        loadQuizzes()
    }, [])

    async function loadQuizzes() {
        try {
            const { data, error } = await supabase
                .from('quizzes')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setQuizzes(data || [])
        } catch (error) {
            console.error('Error loading quizzes:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleStartGame(quizId: string) {
        setCreating(true)
        try {
            const { gameId, pin } = await createGame(quizId)
            router.push(`/host?id=${gameId}&pin=${pin}`)
        } catch (error) {
            console.error('Error creating game:', error)
            alert('Failed to create game')
        } finally {
            setCreating(false)
        }
    }

    const categories = ['all', ...new Set(quizzes.map(q => q.category))]
    const filteredQuizzes = selectedCategory === 'all'
        ? quizzes
        : quizzes.filter(q => q.category === selectedCategory)

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-obsidian via-obsidian-light to-obsidian flex items-center justify-center">
                <div className="text-center">
                    <Sparkles className="w-12 h-12 text-electric-purple animate-pulse mx-auto mb-4" />
                    <p className="text-white/60">Loading quiz packs...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-obsidian via-obsidian-light to-obsidian p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Select Your Quiz Pack
                    </h1>
                    <p className="text-white/60 text-lg">
                        {quizzes.length} premium quiz packs ready to play
                    </p>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-3 justify-center mb-8">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2 rounded-full font-medium transition-all ${selectedCategory === cat
                                ? 'bg-electric-purple text-white shadow-glow-purple'
                                : 'bg-white/10 text-white/60 hover:bg-white/20'
                                }`}
                        >
                            {cat === 'all' ? 'All Categories' : cat}
                        </button>
                    ))}
                </div>

                {/* Quiz Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredQuizzes.map((quiz) => (
                        <div
                            key={quiz.id}
                            className="glass-card p-6 hover:scale-105 transition-transform cursor-pointer group"
                            onClick={() => !creating && handleStartGame(quiz.id)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-electric-purple transition-colors">
                                        {quiz.title}
                                    </h3>
                                    <p className="text-neon-cyan text-sm font-medium">
                                        {quiz.category}
                                    </p>
                                </div>
                                <ChevronRight className="w-6 h-6 text-white/40 group-hover:text-electric-purple group-hover:translate-x-1 transition-all" />
                            </div>
                            <button
                                disabled={creating}
                                className="w-full bg-gradient-to-r from-electric-purple to-neon-cyan text-white font-bold py-3 rounded-lg hover:shadow-glow-purple transition-all disabled:opacity-50"
                            >
                                {creating ? 'Starting...' : 'Start Game'}
                            </button>
                        </div>
                    ))}
                </div>

                {filteredQuizzes.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-white/40 text-lg">No quizzes found in this category</p>
                    </div>
                )}
            </div>
        </div>
    )
}
