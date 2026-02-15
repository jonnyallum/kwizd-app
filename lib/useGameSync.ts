import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { Telemetry } from './telemetry'

export interface Game {
    id: string
    quiz_id: string
    pin: string
    status: 'lobby' | 'active' | 'finished'
    current_question_id: string | null
    question_started_at: string | null
    host_id: string | null
    created_at: string
}

export interface Player {
    id: string
    game_id: string
    team_name: string
    buzzer_sound: string
    score: number
    last_seen_at: string
}

export interface Response {
    id: string
    game_id: string
    player_id: string
    question_id: string
    answer: string | null
    is_correct: boolean | null
    speed_ms: number
    created_at: string
}

export type ConnectionStatus = 'connecting' | 'connected' | 'error' | 'reconnecting'

export function useGameSync(gameId: string | null) {
    const [game, setGame] = useState<Game | null>(null)
    const [players, setPlayers] = useState<Player[]>([])
    const [responses, setResponses] = useState<Response[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting')

    useEffect(() => {
        if (!gameId) {
            setLoading(false)
            return
        }

        let channel: RealtimeChannel | null = null
        let retryCount = 0
        let isActive = true
        const maxRetries = 3

        const setupRealtimeSubscription = async () => {
            if (!isActive) return

            Telemetry.log('INFO', `Initializing Realtime for Game: ${gameId}`)
            const startTime = performance.now()

            try {
                if (retryCount > 0) setConnectionStatus('reconnecting')

                const { data: gameData, error: gameError } = await supabase
                    .from('games')
                    .select('*')
                    .eq('id', gameId)
                    .single()

                if (gameError) throw gameError
                if (isActive) setGame(gameData)

                const { data: playersData, error: playersError } = await supabase
                    .from('players')
                    .select('*')
                    .eq('game_id', gameId)
                    .order('score', { ascending: false })

                if (playersError) throw playersError
                if (isActive) setPlayers(playersData || [])

                const { data: responsesData, error: responsesError } = await supabase
                    .from('responses')
                    .select('*')
                    .eq('game_id', gameId)

                if (!responsesError && isActive) setResponses(responsesData || [])

                if (!isActive) return

                channel = supabase.channel(`game:${gameId}`)
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
                        (payload) => {
                            if (payload.eventType === 'UPDATE' && isActive) setGame(payload.new as Game)
                        }
                    )
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'players', filter: `game_id=eq.${gameId}` },
                        (payload) => {
                            if (!isActive) return
                            if (payload.eventType === 'INSERT') {
                                setPlayers((prev) => {
                                    const exists = prev.some(p => p.id === payload.new.id)
                                    if (exists) return prev
                                    return [...prev, payload.new as Player]
                                })
                            } else if (payload.eventType === 'UPDATE') {
                                setPlayers((prev) =>
                                    prev.map((p) => (p.id === payload.new.id ? (payload.new as Player) : p))
                                )
                            } else if (payload.eventType === 'DELETE') {
                                setPlayers((prev) => prev.filter((p) => p.id !== payload.old.id))
                            }
                        }
                    )
                    .on(
                        'postgres_changes',
                        { event: 'INSERT', schema: 'public', table: 'responses', filter: `game_id=eq.${gameId}` },
                        (payload) => {
                            if (!isActive) return
                            setResponses((prev) => {
                                const exists = prev.some(r => r.id === payload.new.id)
                                if (exists) return prev
                                return [...prev, payload.new as Response]
                            })
                        }
                    )
                    .subscribe((status) => {
                        if (!isActive) return
                        if (status === 'SUBSCRIBED') {
                            setConnectionStatus('connected')
                            Telemetry.trackMetric(
                                'sync_latency',
                                Math.round(performance.now() - startTime),
                                'ms'
                            )
                            Telemetry.log('INFO', 'Realtime Subscribed Successfully')
                        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                            setConnectionStatus('error')
                            Telemetry.log('ERROR', 'Realtime Connection Failed', { status })
                        }
                    })

                if (isActive) {
                    setLoading(false)
                }
            } catch (err) {
                Telemetry.log('CRITICAL', 'Realtime Subscription Exception', { error: err })
                console.error(`[Kwizz] Sync error (Attempt ${retryCount + 1}/${maxRetries}):`, err)

                if (isActive && retryCount < maxRetries) {
                    retryCount++
                    const delay = Math.pow(2, retryCount) * 1000
                    setTimeout(setupRealtimeSubscription, delay)
                } else if (isActive) {
                    setError(err instanceof Error ? err.message : 'Failed to load game')
                    setLoading(false)
                    setConnectionStatus('error')
                }
            }
        }

        setupRealtimeSubscription()

        const pollInterval = setInterval(async () => {
            if (!gameId || connectionStatus === 'connected' || !isActive) return
            try {
                const { data: gameData } = await supabase
                    .from('games').select('*').eq('id', gameId).single()
                if (gameData && isActive) {
                    setGame(prev => {
                        if (!prev || prev.status !== gameData.status || prev.current_question_id !== gameData.current_question_id) {
                            return gameData
                        }
                        return prev
                    })
                }

                const { data: playersData } = await supabase
                    .from('players').select('*').eq('game_id', gameId).order('score', { ascending: false })
                if (playersData && isActive) {
                    setPlayers(prev => {
                        if (prev.length !== playersData.length) return playersData
                        const changed = prev.some((p, i) => p.score !== playersData[i]?.score || p.id !== playersData[i]?.id)
                        return changed ? playersData : prev
                    })
                }

                const { data: responsesData } = await supabase
                    .from('responses').select('*').eq('game_id', gameId)
                if (responsesData && isActive) {
                    setResponses(prev => prev.length !== responsesData.length ? responsesData : prev)
                }
            } catch {
                // Silent fail on poll
            }
        }, 3000)

        return () => {
            isActive = false
            clearInterval(pollInterval)
            if (channel) supabase.removeChannel(channel)
        }
    }, [gameId])

    return { game, setGame, players, setPlayers, responses, setResponses, loading, error, connectionStatus }
}

export async function createGame(quizId: string, hostId: string): Promise<{ gameId: string; pin: string }> {
    // 1. Verify credits before creation
    const { hasCredits, error: creditError } = await checkHostCredits(hostId)
    if (creditError) throw new Error(creditError)
    if (!hasCredits) throw new Error('Insufficient credits to host a game.')

    const pin = Math.floor(1000 + Math.random() * 9000).toString()

    const { data, error } = await supabase
        .from('games')
        .insert({
            quiz_id: quizId,
            pin,
            status: 'lobby',
            host_id: hostId
        })
        .select()
        .single()

    if (error) throw error

    // 2. Deduct credit immediately on game creation (reservation)
    const { error: deductError } = await deductHostCredit(hostId)
    if (deductError) {
        // Rollback game creation if deduction fails (safety first)
        await supabase.from('games').delete().eq('id', data.id)
        throw new Error('Transaction failed: Could not deduct credit.')
    }

    return { gameId: data.id, pin: data.pin }
}

export async function checkHostCredits(hostId: string): Promise<{ hasCredits: boolean; credits: number; error?: string }> {
    try {
        const { data: host, error: hostError } = await supabase
            .from('hosts')
            .select('free_credits_remaining')
            .eq('id', hostId)
            .single()

        if (hostError) return { hasCredits: false, credits: 0, error: 'Host not found' }

        const { data: credits, error: creditsError } = await supabase
            .from('host_credits')
            .select('credits_remaining')
            .eq('host_id', hostId)

        const totalCredits = (host.free_credits_remaining || 0) +
            (credits?.reduce((acc, c) => acc + c.credits_remaining, 0) || 0)

        return { hasCredits: totalCredits > 0, credits: totalCredits }
    } catch (err) {
        return { hasCredits: false, credits: 0, error: 'Failed to verify credits' }
    }
}

async function deductHostCredit(hostId: string): Promise<{ success: boolean; error?: string }> {
    try {
        // 1. Try free credits first
        const { data: host } = await supabase
            .from('hosts')
            .select('free_credits_remaining')
            .eq('id', hostId)
            .single()

        if (host && host.free_credits_remaining > 0) {
            const { error } = await supabase
                .from('hosts')
                .update({ free_credits_remaining: host.free_credits_remaining - 1 })
                .eq('id', hostId)
            if (!error) return { success: true }
        }

        // 2. Try paid credits
        const { data: paidCredits } = await supabase
            .from('host_credits')
            .select('id, credits_remaining')
            .eq('host_id', hostId)
            .gt('credits_remaining', 0)
            .order('created_at', { ascending: true })
            .limit(1)

        if (paidCredits && paidCredits.length > 0) {
            const { error } = await supabase
                .from('host_credits')
                .update({ credits_remaining: paidCredits[0].credits_remaining - 1 })
                .eq('id', paidCredits[0].id)
            if (!error) return { success: true }
        }

        return { success: false, error: 'No credits available' }
    } catch (err) {
        return { success: false, error: 'Deduction failed' }
    }
}

export async function joinGame(pin: string, teamName: string): Promise<{ gameId: string; playerId: string }> {
    const { data: game, error: gameError } = await supabase
        .from('games')
        .select('id, status')
        .eq('pin', pin)
        .single()

    if (gameError) throw new Error('Game not found. Check your PIN.')
    if (game.status === 'finished') throw new Error('This game has already ended.')

    const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({ game_id: game.id, team_name: teamName })
        .select()
        .single()

    if (playerError) {
        if (playerError.code === '23505') throw new Error('Team name already taken in this game.')
        throw playerError
    }

    return { gameId: game.id, playerId: player.id }
}

export async function submitAnswer(
    gameId: string,
    playerId: string,
    questionId: string,
    answer: string,
    speedMs: number
): Promise<{ isCorrect: boolean; pointsEarned: number }> {
    // 1. Fetch question details including type
    const { data: question, error: qError } = await supabase
        .from('questions')
        .select('answer, type')
        .eq('id', questionId)
        .single()

    if (qError) throw qError

    let isCorrect = false
    let pointsEarned = 0

    // 2. Determine correctness based on type
    if (question.type === 'buzzin') {
        const { count } = await supabase.from('responses').select('*', { count: 'exact', head: true })
            .eq('question_id', questionId).eq('answer', 'BUZZ')

        if (count && count > 0) return { isCorrect: false, pointsEarned: 0 }

        isCorrect = answer === 'BUZZ'
        pointsEarned = 500
    } else if (question.type === 'numeral') {
        const userNum = parseFloat(answer)
        const targetNum = parseFloat(question.answer)
        isCorrect = userNum === targetNum
    } else {
        isCorrect = question.answer.toLowerCase() === answer.toLowerCase()
    }

    // 3. Points calculation: 1000 base for correct (non-buzzin), minus speed penalty
    if (isCorrect && question.type !== 'buzzin') {
        pointsEarned = Math.max(100, 1000 - Math.floor(speedMs / 10))
    }

    // 4. Insert response
    const { error: rError } = await supabase.from('responses').insert({
        game_id: gameId,
        player_id: playerId,
        question_id: questionId,
        answer,
        is_correct: isCorrect,
        speed_ms: speedMs
    })

    if (rError) throw rError

    // 5. Update player score
    if (isCorrect) {
        const { data: player } = await supabase
            .from('players')
            .select('score')
            .eq('id', playerId)
            .single()

        if (player) {
            await supabase
                .from('players')
                .update({ score: player.score + pointsEarned })
                .eq('id', playerId)
        }
    }

    return { isCorrect, pointsEarned }
}

// Legacy buzzer function (kept for backward compat)
export async function submitBuzzer(
    gameId: string,
    playerId: string,
    questionId: string,
    speedMs: number
): Promise<void> {
    const { error } = await supabase.from('responses').insert({
        game_id: gameId,
        player_id: playerId,
        question_id: questionId,
        speed_ms: speedMs
    })
    if (error) throw error
}

export async function updateGameStatus(gameId: string, status: Game['status']): Promise<void> {
    const { error } = await supabase
        .from('games')
        .update({ status })
        .eq('id', gameId)
    if (error) throw error
}

export async function setCurrentQuestion(gameId: string, questionId: string | null): Promise<void> {
    const { error } = await supabase
        .from('games')
        .update({
            current_question_id: questionId,
            question_started_at: questionId ? new Date().toISOString() : null
        })
        .eq('id', gameId)
    if (error) throw error
}
