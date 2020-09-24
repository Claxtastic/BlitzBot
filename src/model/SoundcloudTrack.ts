import * as Discord from "discord.js"
import { Track } from "./Track"

export class SoundcloudTrack implements Track {

    url: string
    title: string
    duration: string
    durationMs: number
    thumbnail: string
    voiceChannel: Discord.VoiceChannel
    streamUrl: string
    type: string

    constructor(url: string, title: string, duration: string, durationMs: number, thumbnail: string, 
        voiceChannel: Discord.VoiceChannel, streamUrl: string, type: string) { 
        this.url = url
        this.title = title
        this.duration = duration
        this.durationMs = durationMs
        this.thumbnail = thumbnail
        this.voiceChannel = voiceChannel
        this.streamUrl = streamUrl
        this.type = type
    }

    public toString() {
        return `SoundcloudTrack (${this.url}, ${this.title}, ${this.duration}, ${this.durationMs}, ${this.thumbnail}, ${this.voiceChannel}, ${this.streamUrl}, ${this.type})`
    }
}