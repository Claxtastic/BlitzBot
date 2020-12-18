import * as Discord from "discord.js"
import { Track } from "./Track";

export class YoutubeTrack implements Track {

  url: string
  title: string
  duration: string
  durationMs: number
  thumbnail: string
  voiceChannel: Discord.VoiceChannel
  type: string

  constructor(url: string, title: string, duration: string, durationMs: number, thumbnail: string,
              voiceChannel: Discord.VoiceChannel, type: string) {
    this.url = url
    this.title = title
    this.duration = duration
    this.durationMs = durationMs
    this.thumbnail = thumbnail
    this.voiceChannel = voiceChannel
    this.type = type
  }

  public toString() {
    return `YoutubeTrack (${this.url}, ${this.title}, ${this.duration}, ${this.durationMs}, ${this.thumbnail}, ${this.voiceChannel}, ${this.type})`
  }
}