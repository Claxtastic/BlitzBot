import { DiscordAPIError } from "discord.js";

import * as Discord from "discord.js"

export class Track {
    
    url: string
    title: string
    duration: string
    durationMs: number
    thumbnail: string
    voiceChannel: Discord.VoiceChannel

    constructor(url: string, title: string, duration: string, durationMs: number, thumbnail: string, voiceChannel: Discord.VoiceChannel) {
        this.url = url
        this.title = title
        this.duration = duration
        this.durationMs = durationMs
        this.thumbnail = thumbnail
        this.voiceChannel = voiceChannel
    }

    public toString(): string {
        return `Track (${this.url}, ${this.title}, ${this.duration}, ${this.durationMs}, ${this.thumbnail}, ${this.voiceChannel})`
    }
}