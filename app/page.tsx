'use client'

import { motion } from 'framer-motion'
import { Zap, Play, Settings, Users, Trophy, MessageSquare, LogIn, CreditCard } from 'lucide-react'
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
          className="flex flex-col md:flex-row gap-6 justify-center items-center"
        >
          <Link href="/select" className="group">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 rounded-2xl bg-white text-obsidian font-black text-xl flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
            >
              <Zap className="w-6 h-6 fill-obsidian group-hover:scale-125 transition-transform" />
              Host a Game
            </motion.div>
          </Link>

          <Link href="/play" className="group">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 rounded-2xl border-gradient text-white font-black text-xl flex items-center justify-center gap-3 transition-all glass hover:shadow-[0_0_40px_rgba(0,242,255,0.2)]"
            >
              <Play className="w-6 h-6 fill-white group-hover:scale-125 transition-transform" />
              Join Game
            </motion.div>
          </Link>

          <Link href="/pricing" className="flex items-center justify-center">
            <motion.div
              whileHover={{ x: 5 }}
              className="text-white/40 hover:text-white transition-colors text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Pricing
            </motion.div>
          </Link>

          <Link href="/login" className="flex items-center justify-center">
            <motion.div
              whileHover={{ x: 5 }}
              className="text-white/40 hover:text-white transition-colors text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Enter Portal
            </motion.div>
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

      {/* Navigation Footer / Neural Registry */}
      <div className="relative mt-24 md:mt-32 flex flex-col items-center gap-4 pb-8">
        <div className="flex flex-col items-center opacity-20 hover:opacity-100 transition-opacity duration-500">
          <p className="text-[10px] tracking-[0.4em] text-white uppercase mb-2">Kwizz.co.uk // Neural Node_03</p>
          <div className="flex gap-4 text-[9px] font-black text-white/40 uppercase tracking-tighter">
            <span className="hover:text-neon-cyan transition-colors cursor-default">@Conductor</span>
            <span className="hover:text-neon-cyan transition-colors cursor-default">@JonnyAI</span>
            <span className="hover:text-neon-cyan transition-colors cursor-default">@Pixel</span>
            <span className="hover:text-neon-cyan transition-colors cursor-default">@Sentinel</span>
            <span className="hover:text-neon-cyan transition-colors cursor-default">@Watcher</span>
          </div>
        </div>

        <div className="flex flex-col items-center group cursor-pointer">
          <span className="text-[8px] font-black text-white/20 tracking-[0.5em] uppercase mb-1">Built By</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-black text-white tracking-tighter uppercase group-hover:text-neon-cyan transition-colors">Jonny</span>
            <span className="text-sm font-black text-neon-cyan tracking-tighter uppercase group-hover:text-white transition-colors">Ai</span>
          </div>
          <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent mt-1" />
        </div>
      </div>
    </main>
  )
}
