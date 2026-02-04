'use client'

import { motion } from 'framer-motion'
import { Zap, Play, Settings, Users, Trophy, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-6 overflow-hidden bg-obsidian">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-electric-purple/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-cyan/20 blur-[120px] rounded-full" />

      {/* Animated Floating Shapes */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-[15%] w-64 h-64 glass rounded-3xl rotate-12 opacity-50 hidden md:block"
      />
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-[10%] w-48 h-48 glass rounded-full opacity-30 hidden md:block"
      />

      {/* Hero Section */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-center mb-8"
        >
          <div className="relative w-32 h-32 md:w-40 md:h-40 glow-purple">
            <Image
              src="/logo.png"
              alt="Kwizz Logo"
              fill
              className="object-contain animate-pulse-slow"
              priority
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-none"
        >
          <span className="text-white">Next-Gen</span><br />
          <span className="text-gradient">Quizzing</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light tracking-wide uppercase"
        >
          Ultra-low latency. Zero app downloads. Infinite AI quiz packs.
          The ultimate smartphone pub quiz experience.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col md:flex-row gap-6 justify-center"
        >
          <Link href="/select" className="group">
            <div className="px-10 py-5 rounded-2xl bg-white text-obsidian font-bold text-xl flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              <Zap className="w-6 h-6 fill-obsidian" />
              Host a Game
            </div>
          </Link>

          <Link href="/play" className="group">
            <div className="px-10 py-5 rounded-2xl border-gradient text-white font-bold text-xl flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 glass">
              <Play className="w-6 h-6 fill-white" />
              Join Game
            </div>
          </Link>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
        >
          {[
            { icon: Users, label: "QR Join", desc: "No App Needed" },
            { icon: MessageSquare, label: "Live Chat", desc: "Interact Now" },
            { icon: Trophy, label: "Dynamic", desc: "Auto-Scoring" },
            { icon: Zap, label: "Instant", desc: "0ms Latency" }
          ].map((f, i) => (
            <div key={i} className="p-6 rounded-3xl glass-dark group hover:border-neon-cyan/30 transition-all duration-500">
              <f.icon className="w-8 h-8 mx-auto mb-3 text-neon-cyan group-hover:text-electric-purple transition-colors duration-500" />
              <div className="text-white font-bold text-sm tracking-widest uppercase">{f.label}</div>
              <div className="text-gray-500 text-xs mt-1 uppercase tracking-tighter">{f.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 right-0 text-center opacity-20 hover:opacity-100 transition-opacity">
        <p className="text-xs tracking-[0.5em] text-white uppercase">Kwizz.co.uk &copy; 2026</p>
      </div>
    </main>
  )
}
