import * as Discord from "discord.js"

export interface Track {
    
    url: string
    title: string
    duration: string
    durationMs: number
    thumbnail: string
    voiceChannel: Discord.VoiceChannel
    type: string

    toString(): string
}