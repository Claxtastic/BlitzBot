import * as Discord from "discord.js"
import { Track } from "./Track"

export class SoundcloudTrack extends Track {

    streamUrl: string

    constructor(url: string, title: string, duration: string, durationMs: number, thumbnail: string, voiceChannel: Discord.VoiceChannel, streamUrl: string) { 
        super(url, title, duration, durationMs, thumbnail, voiceChannel) 
        this.streamUrl = streamUrl
    }
}