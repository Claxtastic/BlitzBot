import * as Discord from "discord.js"

export interface Track {

  url: string
  title: string
  duration: string
  durationSec: number
  thumbnail: string
  voiceChannel: Discord.VoiceChannel
  type: string
  seekTime: number

  toString(): string
}