'use client'

import { motion } from 'framer-motion'
import { Zap, CreditCard, Infinity, Building2, Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const tiers = [
    {
        name: 'Free Trial',
        icon: Zap,
        price: '£0',
        period: '',
        headline: '3 quiz nights on us',
        description: 'Full features. No card needed. No catch.',
        cta: 'Start Free',
        ctaLink: '/login',
        featured: false,
        features: [
            '3 full quiz nights',
            'Unlimited players per session',
            '70+ AI-generated questions',
            'QR code join — no app needed',
            'Real-time leaderboards',
        ],
        color: 'white/10',
        glowColor: 'white/5',
    },
    {
        name: 'Pay As You Go',
        icon: CreditCard,
        price: '£16.80',
        period: '/quiz night',
        headline: 'Buy credits. Use anytime.',
        description: 'Credits never expire. Buy 10, save 17%.',
        cta: 'Buy Credits',
        ctaLink: '/login',
        featured: true,
        features: [
            'Everything in Free Trial',
            'Single: £16.80/night',
            '10-pack: £140 (£14/night)',
            '52-pack: £780 (£15/night)',
            'Credits never expire',
            '20% cheaper than SpeedQuizzing',
        ],
        color: 'neon-cyan/20',
        glowColor: 'neon-cyan/10',
    },
    {
        name: 'Unlimited',
        icon: Infinity,
        price: '£39',
        period: '/month',
        headline: 'Run as many quizzes as you want',
        description: 'Best value at 2+ quizzes per week.',
        cta: 'Go Unlimited',
        ctaLink: '/login',
        featured: false,
        features: [
            'Everything in Pay As You Go',
            'Unlimited quiz activations',
            'Branded leaderboards (your logo)',
            'Analytics dashboard',
            'Multi-venue support',
            '~£4.88/quiz at 2/week',
        ],
        color: 'electric-purple/20',
        glowColor: 'electric-purple/10',
    },
]

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-obsidian relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-electric-purple/10 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-neon-cyan/10 blur-[150px] rounded-full" />

            <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-20"
                >
                    <Link href="/" className="inline-block mb-8">
                        <span className="text-white/20 text-xs font-black uppercase tracking-[0.5em] hover:text-white/40 transition-colors">
                            ← Back to Kwizz
                        </span>
                    </Link>

                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase italic tracking-tighter">
                        Try free. Pay per quiz.{' '}
                        <span className="text-gradient">Or go unlimited.</span>
                    </h1>

                    <div className="flex items-center justify-center gap-2 md:gap-4">
                        <div className="hidden sm:block h-[1px] w-8 md:w-12 bg-white/20" />
                        <p className="text-white/40 text-[10px] md:text-sm tracking-[0.1em] md:tracking-[0.2em] font-light uppercase px-4 text-balance">
                            No app downloads. No contracts. Cancel anytime.
                        </p>
                        <div className="hidden sm:block h-[1px] w-8 md:w-12 bg-white/20" />
                    </div>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {tiers.map((tier, idx) => (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.15 }}
                            className={`relative rounded-[2.5rem] p-1 ${tier.featured
                                ? 'bg-gradient-to-b from-neon-cyan/50 to-electric-purple/50'
                                : 'bg-white/5'
                                }`}
                        >
                            {tier.featured && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-obsidian text-xs font-black uppercase tracking-widest px-6 py-2 rounded-full">
                                    Most Popular
                                </div>
                            )}

                            <div className="bg-obsidian rounded-[2.3rem] p-10 h-full flex flex-col">
                                {/* Icon + Name */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-14 h-14 rounded-2xl bg-${tier.color} flex items-center justify-center`}>
                                        <tier.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                            {tier.name}
                                        </h3>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black text-white">{tier.price}</span>
                                        <span className="text-white/40 text-sm font-bold">{tier.period}</span>
                                    </div>
                                    <p className="text-white/60 text-sm mt-2">{tier.headline}</p>
                                </div>

                                {/* Description */}
                                <p className="text-white/30 text-xs uppercase tracking-widest mb-8">
                                    {tier.description}
                                </p>

                                {/* Features */}
                                <div className="flex-1 space-y-4 mb-10">
                                    {tier.features.map((feature, fIdx) => (
                                        <div key={fIdx} className="flex items-start gap-3">
                                            <Check className="w-4 h-4 text-neon-cyan mt-0.5 flex-shrink-0" />
                                            <span className="text-white/70 text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA */}
                                <Link href={tier.ctaLink}>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-tight flex items-center justify-center gap-3 transition-all ${tier.featured
                                            ? 'bg-white text-obsidian hover:bg-neon-cyan hover:shadow-[0_0_40px_rgba(0,242,255,0.3)]'
                                            : 'bg-white/5 text-white border-2 border-white/10 hover:border-white/30 hover:bg-white/10'
                                            }`}
                                    >
                                        {tier.cta}
                                        <ArrowRight className="w-5 h-5" />
                                    </motion.button>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Corporate CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center mb-20 px-4 sm:px-0"
                >
                    <div className="glass-dark inline-block px-6 md:px-12 py-8 rounded-[2rem] border border-white/5 w-full sm:w-auto">
                        <div className="flex items-center gap-4 justify-center mb-4">
                            <Building2 className="w-8 h-8 text-electric-purple" />
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                                Corporate Events
                            </h3>
                        </div>
                        <p className="text-white/40 text-sm mb-6 max-w-md">
                            Team building, conferences, and private events. Managed hosting, branded questions, post-event reports.
                        </p>
                        <Link href="/contact">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-electric-purple/20 text-electric-purple font-black py-4 px-10 rounded-2xl border-2 border-electric-purple/30 hover:bg-electric-purple/30 transition-all uppercase tracking-widest text-sm"
                            >
                                Talk to Us →
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>

                {/* Comparison Strip */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="glass-dark rounded-[2rem] p-10 border border-white/5"
                >
                    <h3 className="text-xl font-black text-white uppercase tracking-widest mb-8 text-center">
                        Kwizz vs SpeedQuizzing
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                label: 'Per Event',
                                kwizz: '£16.80',
                                competitor: '£21.00',
                                saving: '20% cheaper',
                            },
                            {
                                label: 'Bulk (10 events)',
                                kwizz: '£14.00/event',
                                competitor: '~£18/event',
                                saving: '22% cheaper',
                            },
                            {
                                label: 'Unlimited (4/week)',
                                kwizz: '£2.44/event',
                                competitor: 'Not available',
                                saving: 'Exclusive to Kwizz',
                            },
                        ].map((row, idx) => (
                            <div key={idx} className="text-center">
                                <p className="text-white/30 text-xs font-black uppercase tracking-widest mb-3">
                                    {row.label}
                                </p>
                                <div className="flex items-center justify-center gap-4 mb-2">
                                    <div>
                                        <p className="text-neon-cyan font-black text-2xl">{row.kwizz}</p>
                                        <p className="text-white/20 text-[10px] uppercase tracking-widest">Kwizz</p>
                                    </div>
                                    <span className="text-white/10 text-xl">vs</span>
                                    <div>
                                        <p className="text-white/30 font-black text-2xl line-through">{row.competitor}</p>
                                        <p className="text-white/20 text-[10px] uppercase tracking-widest">SpeedQuizzing</p>
                                    </div>
                                </div>
                                <p className="text-neon-cyan/60 text-xs font-bold uppercase tracking-wider">
                                    {row.saving}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* FAQ / Trust Strip */}
                <div className="mt-16 text-center">
                    <div className="flex flex-wrap justify-center gap-8 text-white/20 text-xs font-black uppercase tracking-[0.3em]">
                        <span>No contracts</span>
                        <span>•</span>
                        <span>Cancel anytime</span>
                        <span>•</span>
                        <span>Credits never expire</span>
                        <span>•</span>
                        <span>Players always free</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-20 text-center">
                    <div className="flex flex-col items-center group">
                        <span className="text-[8px] font-black text-white/20 tracking-[0.5em] uppercase mb-1">Built By</span>
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-black text-white tracking-tighter uppercase group-hover:text-neon-cyan transition-colors">Jonny</span>
                            <span className="text-sm font-black text-neon-cyan tracking-tighter uppercase group-hover:text-white transition-colors">Ai</span>
                        </div>
                        <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent mt-1" />
                    </div>
                </div>
            </div>
        </div>
    )
}
