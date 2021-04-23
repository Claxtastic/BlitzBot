import * as Discord from "discord.js"
import { IBotCommand } from "../api"
import { mediaData, log } from "../index"
import utils from "../utils"

export default class skip implements IBotCommand {

  private readonly commands: string[] = ["skip", "s"]

  help(): string[] {
    return ["skip", "Skip the currently playing track, all tracks, or add a number to skip the next x tracks."]
  }

  isThisCommand(command: string): boolean {
    return this.commands.includes(command)
  }

  async executeCommand(params: string[], message: Discord.Message, client: Discord.Client) {
    if (mediaData.queue != undefined) {
      if (mediaData.queue.length === 0) {
        await message.reply("No track is playing!")
      }
      if (mediaData.streamDispatcher != undefined) {
        if (params[0]) {
          if (params[0] === "all") {
            const numberOfTracksToSkip: number = mediaData.queue.length
            log.info(`Skipping all tracks (${numberOfTracksToSkip})`)
            for (let i = 0; i < numberOfTracksToSkip; i++) {
              utils.removeAndEndTrack(mediaData)
            }
            await message.channel.send(`**Skipped all tracks in queue!** :fast_forward:`)
          }
          else if (parseInt(params[0]) != undefined) {
            log.info(`Skipping next ${params[0]} tracks`)
            for (let i = 0; i < parseInt(params[0])-1; i++) {
              utils.removeAndEndTrack(mediaData)
            }
            await message.channel.send(`**Skipped ${params[0]} tracks!** :fast_forward:`)
          }
        } else {
          const skippedTrackTitle: string = mediaData.queue[0].title
          mediaData.streamDispatcher.end()
          await message.channel.send(`\`${skippedTrackTitle}\` :fast_forward: **skipped!**`)
        }
      }
    }
  }
}
