'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { createGame, checkHostCredits } from '@/lib/useGameSync'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, ChevronRight, Lock, CreditCard, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
    const [hostId, setHostId] = useState<string | null>(null)
    const [hostEmail, setHostEmail] = useState<string>('')
    const [credits, setCredits] = useState<number>(0)
    const [verifying, setVerifying] = useState(true)
    const [showLogin, setShowLogin] = useState(true)
    const router = useRouter()

    useEffect(() => {
        loadQuizzes()
        checkStoredHost()
    }, [])

    async function checkStoredHost() {
        const stored = localStorage.getItem('kwizz_host')
        if (stored) {
            try {
                const h = JSON.parse(stored)
                setHostId(h.id)
                setHostEmail(h.email)
                const { credits: c } = await checkHostCredits(h.id)
                setCredits(c)
                setShowLogin(false)
            } catch (e) {
                localStorage.removeItem('kwizz_host')
            }
        }
        setVerifying(false)
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setVerifying(true)
        try {
            const { data, error } = await supabase
                .from('hosts')
                .select('*')
                .eq('email', hostEmail)
                .single()

            if (error) {
                // If not found, create trial host
                const { data: newHost, error: createError } = await supabase
                    .from('hosts')
                    .insert({ email: hostEmail, display_name: hostEmail.split('@')[0] })
                    .select()
                    .single()

                if (createError) throw createError
                setHostId(newHost.id)
                setCredits(3)
                localStorage.setItem('kwizz_host', JSON.stringify(newHost))
            } else {
                setHostId(data.id)
                const { credits: c } = await checkHostCredits(data.id)
                setCredits(c)
                localStorage.setItem('kwizz_host', JSON.stringify(data))
            }
            setShowLogin(false)
        } catch (err) {
            alert('Failed to enter portal')
        } finally {
            setVerifying(false)
        }
    }

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
        if (!hostId) {
            setShowLogin(true)
            return
        }
        if (credits <= 0) {
            alert('Insufficient credits. Please top up to host a new game.')
            router.push('/pricing')
            return
        }

        setCreating(true)
        try {
            const { gameId, pin } = await createGame(quizId, hostId)
            router.push(`/host?id=${gameId}&pin=${pin}`)
        } catch (error) {
            console.error('Error creating game:', error)
            alert(error instanceof Error ? error.message : 'Failed to create game')
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

            {/* Header / Nav */}
            <div className="max-w-6xl mx-auto flex justify-between items-center mb-12 relative z-20">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <div className="text-2xl font-black text-white italic tracking-tighter cursor-pointer">
                            K<span className="text-neon-cyan">WIZZ</span>
                        </div>
                    </Link>
                </div>
                <div className="flex items-center gap-6">
                    {hostId && (
                        <div className="flex items-center gap-4">
                            <div className="glass-dark px-4 py-2 rounded-xl flex items-center gap-2 border border-white/5">
                                <CreditCard className="w-4 h-4 text-neon-cyan" />
                                <span className="text-white font-bold text-sm">{credits} Credits</span>
                            </div>
                            <div className="glass-dark px-4 py-2 rounded-xl flex items-center gap-2 border border-white/5">
                                <User className="w-4 h-4 text-white/40" />
                                <span className="text-white/60 text-xs font-bold">{hostEmail}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl sm:text-7xl font-black text-white mb-6 uppercase italic tracking-tighter">
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
                            className={`px-4 py-2 sm:px-8 sm:py-3 rounded-full font-black text-[10px] sm:text-sm uppercase tracking-widest transition-all border-2 ${selectedCategory === cat
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

                {/* Login Overlay */}
                <AnimatePresence>
                    {showLogin && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-obsidian/90 backdrop-blur-xl"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                className="w-full max-w-md glass-dark p-8 rounded-[2.5rem] border-gradient"
                            >
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-electric-purple/10 rounded-2xl sm:rounded-3xl mx-auto mb-6 flex items-center justify-center border border-electric-purple/20">
                                        <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-electric-purple" />
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Neural Registry</h2>
                                    <p className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em]">Authorized Hosts Only</p>
                                </div>

                                <form onSubmit={handleLogin} className="space-y-6">
                                    <div>
                                        <label className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">Host Email</label>
                                        <input
                                            type="email"
                                            value={hostEmail}
                                            onChange={(e) => setHostEmail(e.target.value)}
                                            placeholder="intel@kwizz.co.uk"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-neon-cyan focus:outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={verifying}
                                        className="w-full bg-white text-obsidian font-black py-5 rounded-2xl uppercase italic tracking-tighter text-xl shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:bg-neon-cyan transition-all"
                                    >
                                        {verifying ? 'Verifying Neural Link...' : 'Enter Portal'}
                                    </motion.button>
                                </form>
                                <p className="text-center text-white/20 text-[9px] font-black uppercase tracking-widest mt-8">
                                    New hosts receive 3 free session credits.
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
