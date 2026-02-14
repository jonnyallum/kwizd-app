
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { LogIn, Github, Mail } from 'lucide-react'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)

    async function handleGoogleLogin() {
        setLoading(true)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            })
            if (error) throw error
        } catch (error) {
            console.error('Login error:', error)
            alert('Failed to initialize Google Login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-obsidian flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-electric-purple/10 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-neon-cyan/10 blur-[150px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full relative z-10"
            >
                <div className="text-center mb-12">
                    <h1 className="text-6xl font-black text-white mb-4 uppercase italic tracking-tighter">
                        Nexus <span className="text-gradient">Access</span>
                    </h1>
                    <p className="text-white/40 text-xs font-black uppercase tracking-[0.4em]">Identify Your Biological Signature</p>
                </div>

                <div className="glass-dark p-10 rounded-[3rem] border-gradient">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-white text-obsidian font-black py-5 rounded-2xl flex items-center justify-center gap-4 transition-all hover:bg-neon-cyan shadow-[0_10px_30px_rgba(255,255,255,0.1)] mb-6"
                    >
                        <LogIn className="w-6 h-6" />
                        {loading ? 'Opening Portal...' : 'Sign in with Google'}
                    </motion.button>

                    <p className="text-white/10 text-[10px] text-center uppercase tracking-widest">
                        End-to-end Neural Encryption Enabled
                    </p>
                </div>

                <div className="mt-12 text-center">
                    <button
                        onClick={() => window.history.back()}
                        className="text-white/20 hover:text-white transition-colors text-xs font-black uppercase tracking-[0.5em]"
                    >
                        Return to Command Center
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
