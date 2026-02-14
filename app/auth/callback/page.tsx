
'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
    const router = useRouter()

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                router.push('/select')
            }
        })

        return () => {
            authListener.subscription.unsubscribe()
        }
    }, [router])

    return (
        <div className="min-h-screen bg-obsidian flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white font-black uppercase tracking-widest">Validating Signature...</p>
            </div>
        </div>
    )
}
