import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Game {
    id: string
    quiz_id: string
    pin: string
    status: 'lobby' | 'active' | 'finished'
    current_question_id: string | null
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

export function useGameSync(gameId: string | null) {
    const [game, setGame] = useState<Game | null>(null)
    const [players, setPlayers] = useState<Player[]>([])
    const [responses, setResponses] = useState<Response[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!gameId) {
            setLoading(false)
            return
        }

        let channel: RealtimeChannel

        const setupRealtimeSubscription = async () => {
            try {
                // Fetch initial game state
                const { data: gameData, error: gameError } = await supabase
                    .from('games')
                    .select('*')
                    .eq('id', gameId)
                    .single()

                if (gameError) throw gameError
                setGame(gameData)

                // Fetch initial players
                const { data: playersData, error: playersError } = await supabase
                    .from('players')
                    .select('*')
                    .eq('game_id', gameId)
                    .order('score', { ascending: false })

                if (playersError) throw playersError
                setPlayers(playersData || [])

                // Subscribe to real-time updates
                channel = supabase.channel(`game:${gameId}`)
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'games',
                            filter: `id=eq.${gameId}`
                        },
                        (payload) => {
                            if (payload.eventType === 'UPDATE') {
                                setGame(payload.new as Game)
                            }
                        }
                    )
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'players',
                            filter: `game_id=eq.${gameId}`
                        },
                        (payload) => {
                            if (payload.eventType === 'INSERT') {
                                setPlayers((prev) => [...prev, payload.new as Player])
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
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'responses',
                            filter: `game_id=eq.${gameId}`
                        },
                        (payload) => {
                            setResponses((prev) => [...prev, payload.new as Response])
                        }
                    )
                    .subscribe()

                setLoading(false)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load game')
                setLoading(false)
            }
        }

        setupRealtimeSubscription()

        return () => {
            if (channel) {
                supabase.removeChannel(channel)
            }
        }
    }, [gameId])

    return { game, players, responses, loading, error }
}

export async function createGame(quizId: string): Promise<{ gameId: string; pin: string }> {
    // Generate a 4-digit PIN
    const pin = Math.floor(1000 + Math.random() * 9000).toString()

    const { data, error } = await supabase
        .from('games')
        .insert({
            quiz_id: quizId,
            pin,
            status: 'lobby'
        })
        .select()
        .single()

    if (error) throw error

    return { gameId: data.id, pin: data.pin }
}

export async function joinGame(pin: string, teamName: string): Promise<{ gameId: string; playerId: string }> {
    // Find game by PIN
    const { data: game, error: gameError } = await supabase
        .from('games')
        .select('id')
        .eq('pin', pin)
        .single()

    if (gameError) throw new Error('Game not found')

    // Create player
    const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({
            game_id: game.id,
            team_name: teamName
        })
        .select()
        .single()

    if (playerError) throw playerError

    return { gameId: game.id, playerId: player.id }
}

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
        .update({ current_question_id: questionId })
        .eq('id', gameId)

    if (error) throw error
}
