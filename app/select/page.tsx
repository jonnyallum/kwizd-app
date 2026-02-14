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

import { motion } from 'framer-motion'

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
            <div className="min-h-screen bg-obsidian flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <Sparkles className="w-16 h-16 text-electric-purple mb-4" />
                    </motion.div>
                    <p className="text-gradient font-bold text-xl uppercase tracking-widest">Loading Packs...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-obsidian p-8 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-electric-purple/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-neon-cyan/10 blur-[150px] rounded-full" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-6xl md:text-7xl font-black text-white mb-6 uppercase italic tracking-tighter">
                        Choose Your <span className="text-gradient">Battle</span>
                    </h1>
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-[1px] w-12 bg-white/20" />
                        <p className="text-white/40 text-sm tracking-[0.3em] font-light uppercase">
                            {quizzes.length} Premium Packs Found
                        </p>
                        <div className="h-[1px] w-12 bg-white/20" />
                    </div>
                </motion.div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-4 justify-center mb-16">
                    {categories.map((cat, idx) => (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all border-2 ${selectedCategory === cat
                                ? 'bg-white text-obsidian border-white shadow-[0_0_30px_rgba(255,255,255,0.3)]'
                                : 'bg-transparent text-white/40 border-white/10 hover:border-white/30 hover:text-white'
                                }`}
                        >
                            {cat === 'all' ? 'Entire Arsenal' : cat}
                        </motion.button>
                    ))}
                </div>

                {/* Quiz Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredQuizzes.map((quiz, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={quiz.id}
                            whileHover={{ y: -10 }}
                            className="glass-dark p-8 rounded-[2rem] border-gradient relative group cursor-pointer"
                            onClick={() => !creating && handleStartGame(quiz.id)}
                        >
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                                    <p className="text-neon-cyan font-black text-xs uppercase tracking-[0.2em]">
                                        {quiz.category}
                                    </p>
                                </div>
                                <h3 className="text-2xl font-black text-white group-hover:text-electric-purple transition-colors duration-300">
                                    {quiz.title}
                                </h3>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={creating}
                                className="w-full bg-white text-obsidian font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:bg-neon-cyan group-hover:shadow-[0_0_30px_rgba(0,242,255,0.4)]"
                            >
                                {creating ? 'Initializing...' : 'Sync & Launch'}
                                <ChevronRight className="w-5 h-5" />
                            </motion.button>
                        </motion.div>
                    ))}
                </div>

                {filteredQuizzes.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/10"
                    >
                        <p className="text-white/20 text-xl font-bold uppercase tracking-widest">No Intelligence Found In This Sector</p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
