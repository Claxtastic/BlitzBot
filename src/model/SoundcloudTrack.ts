import * as Discord from "discord.js"
import { Track } from "./Track"

export class SoundcloudTrack implements Track {

  url: string
  title: string
  duration: string
  durationSec: number
  thumbnail: string
  voiceChannel: Discord.VoiceChannel
  streamUrl: string
  type: string
  seekTime: number = 0

  constructor(url: string, title: string, duration: string, durationSec: number, thumbnail: string,
              voiceChannel: Discord.VoiceChannel, streamUrl: string, type: string, seekTime: number) {
    this.url = url
    this.title = title
    this.duration = duration
    this.durationSec = durationSec
    this.thumbnail = thumbnail
    this.voiceChannel = voiceChannel
    this.streamUrl = streamUrl
    this.type = type
    this.seekTime = seekTime
  }

  public toString() {
    return `SoundcloudTrack (${this.url}, ${this.title}, ${this.duration}, ${this.durationSec}, ${this.thumbnail}, ${this.voiceChannel}, ${this.streamUrl}, ${this.type}, ${this.seekTime})`
  }
}