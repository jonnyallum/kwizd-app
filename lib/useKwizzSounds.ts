import useSound from 'use-sound'

export function useKwizzSounds() {
    const [playBuzzer] = useSound('/sounds/buzzer.mp3', { volume: 0.5 })
    const [playCorrect] = useSound('/sounds/correct.mp3', { volume: 0.5 })
    const [playVictory] = useSound('/sounds/success.mp3', { volume: 0.5 })

    // Synthesized Tick for Countdown
    const playTick = () => {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        if (!AudioContext) return

        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.frequency.value = 800
        osc.type = 'sine'

        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.1)

        osc.start()
        osc.stop(ctx.currentTime + 0.1)
    }

    return { playBuzzer, playCorrect, playVictory, playTick }
}
