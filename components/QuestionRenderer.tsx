'use strict'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Check, X, Hash, ListOrdered, MousePointer2, Type } from 'lucide-react'

export type QuestionType = 'multiple_choice' | 'sequence' | 'numeral' | 'letters' | 'buzzin'

interface Props {
    type: QuestionType
    options: string[]
    answer: string
    onSelect: (answer: string) => void
    disabled: boolean
    selectedAnswer: string | null
    isCorrect?: boolean | null
}

const OPTION_COLORS = [
    { bg: 'bg-electric-purple/20', hover: 'hover:bg-electric-purple/40', border: 'border-electric-purple/30', text: 'text-electric-purple' },
    { bg: 'bg-neon-cyan/20', hover: 'hover:bg-neon-cyan/40', border: 'border-neon-cyan/30', text: 'text-neon-cyan' },
    { bg: 'bg-yellow-500/20', hover: 'hover:bg-yellow-500/40', border: 'border-yellow-500/30', text: 'text-yellow-500' },
    { bg: 'bg-pink-500/20', hover: 'hover:bg-pink-500/40', border: 'border-pink-500/30', text: 'text-pink-500' },
    { bg: 'bg-green-500/20', hover: 'hover:bg-green-500/40', border: 'border-green-500/30', text: 'text-green-500' },
    { bg: 'bg-blue-500/20', hover: 'hover:bg-blue-500/40', border: 'border-blue-500/30', text: 'text-blue-500' },
]

export const QuestionRenderer: React.FC<Props> = ({
    type,
    options,
    answer,
    onSelect,
    disabled,
    selectedAnswer,
    isCorrect
}) => {
    // ─── MULTIPLE CHOICE ───
    if (type === 'multiple_choice') {
        return (
            <div className="grid grid-cols-2 gap-3 w-full max-w-lg mx-auto">
                {options.map((option, idx) => {
                    const color = OPTION_COLORS[idx] || OPTION_COLORS[0]
                    const isSelected = selectedAnswer === option
                    const isCorrectAnswer = isCorrect !== null && option === answer
                    const isWrongSelection = isCorrect === false && isSelected

                    let buttonClass = `${color.bg} ${color.border} border`
                    if (isCorrectAnswer) buttonClass = 'bg-green-500 border-green-400 ring-4 ring-green-400/20'
                    else if (isWrongSelection) buttonClass = 'bg-red-500/50 border-red-400 ring-4 ring-red-400/20'
                    else if (selectedAnswer && !isSelected) buttonClass = 'bg-white/5 border-white/5 opacity-40'

                    return (
                        <motion.button
                            key={idx}
                            whileTap={!disabled ? { scale: 0.95 } : undefined}
                            onClick={() => onSelect(option)}
                            disabled={disabled}
                            className={`relative rounded-2xl p-4 min-h-[100px] flex flex-col items-center justify-center text-center transition-all ${buttonClass}`}
                        >
                            <span className="text-white font-bold text-lg">{option}</span>
                        </motion.button>
                    )
                })}
            </div>
        )
    }

    // ─── SEQUENCE ───
    if (type === 'sequence') {
        const [items, setItems] = useState<string[]>(options)

        const handleSubmit = () => {
            onSelect(items.join('|'))
        }

        return (
            <div className="w-full max-w-md mx-auto space-y-4">
                <p className="text-white/40 text-[10px] uppercase font-black text-center tracking-widest mb-4">Drag to Reorder</p>
                <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-3">
                    {items.map((item, idx) => (
                        <Reorder.Item
                            key={item}
                            value={item}
                            drag={!disabled}
                        >
                            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between group cursor-grab active:cursor-grabbing">
                                <div className="flex items-center gap-4">
                                    <span className="text-neon-cyan font-black text-xl italic">#{idx + 1}</span>
                                    <span className="text-white font-bold">{item}</span>
                                </div>
                                <ListOrdered className="w-5 h-5 text-white/20 group-hover:text-neon-cyan transition-colors" />
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>

                {!disabled && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={handleSubmit}
                        className="w-full bg-neon-cyan text-obsidian font-black py-4 rounded-xl shadow-glow-cyan mt-6 uppercase italic tracking-tighter"
                    >
                        Submit Sequence
                    </motion.button>
                )}
            </div>
        )
    }

    // ─── NUMERAL ───
    if (type === 'numeral') {
        const [value, setValue] = useState('')

        const handleKey = (key: string) => {
            if (disabled) return
            if (key === 'C') setValue('')
            else if (key === '←') setValue(v => v.slice(0, -1))
            else if (value.length < 8) setValue(v => v + key)
        }

        return (
            <div className="w-full max-w-sm mx-auto">
                <div className="bg-white/5 border-2 border-white/10 rounded-3xl p-6 mb-6 text-center">
                    <p className="text-white text-5xl font-black tracking-widest min-h-[60px]">
                        {value || <span className="text-white/10">0</span>}
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '←'].map(key => (
                        <button
                            key={key}
                            onClick={() => handleKey(key)}
                            disabled={disabled}
                            className="bg-white/5 hover:bg-white/10 text-white text-2xl font-bold py-6 rounded-2xl border border-white/5 transition-all active:scale-95 disabled:opacity-20"
                        >
                            {key}
                        </button>
                    ))}
                </div>

                {!disabled && (
                    <button
                        onClick={() => onSelect(value)}
                        disabled={!value}
                        className="w-full bg-electric-purple text-white font-black py-4 rounded-xl mt-6 uppercase italic tracking-tighter shadow-glow-purple disabled:opacity-20"
                    >
                        Transmit Answer
                    </button>
                )}
            </div>
        )
    }

    // ─── BUZZIN ───
    if (type === 'buzzin') {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <motion.button
                    whileHover={!disabled ? { scale: 1.05 } : {}}
                    whileTap={!disabled ? { scale: 0.9 } : {}}
                    onClick={() => onSelect('BUZZ')}
                    disabled={disabled}
                    className={`w-64 h-64 rounded-full flex flex-col items-center justify-center transition-all ${disabled
                        ? 'bg-white/5 border-4 border-white/10 grayscale'
                        : 'bg-red-600 border-8 border-red-500 shadow-[0_0_80px_rgba(220,38,38,0.5)]'
                        }`}
                >
                    <MousePointer2 className="w-16 h-16 text-white mb-2" />
                    <span className="text-white font-black text-3xl uppercase italic tracking-tighter">BUZZ!</span>
                </motion.button>
                <p className="text-white/20 text-[10px] sm:text-xs uppercase font-black tracking-[0.5em] mt-8">Fastest Finger Wins</p>
            </div>
        )
    }

    return null
}
