import { Message, Client } from "discord.js";
import { mediaData } from "../index"
import { IBotCommand } from "../api";
import utils from "../utils";

export default class remove implements IBotCommand {

  private readonly command: string = "remove"

  help(): string[] {
    return ["remove", "Remove the first track which matches the given title text from the queue, or remove the track at the given index"]
  }
  isThisCommand(command: string): boolean {
    return command === this.command
  }
  executeCommand(params: string[], message: Message, client: Client) {
    if (!params[0]) return message.reply("Please provide either a track title (doesn't have to be full title, case insensitive) or a track position (starting at 0) to remove.")
    if (mediaData.queue == null || mediaData.queue.length == 0) return message.reply("No tracks are playing!")

    if (isNaN(Number(params[0]))) {
      let titleQuery = params[0].toLowerCase()
      let matchedTrack = mediaData.queue.filter(track => track.title.toLowerCase().includes(titleQuery))[0]
      if (matchedTrack == mediaData.queue[0]) {
        utils.removeAndEndTrack(mediaData)
        return message.channel.send(`🗑️ Removed ${matchedTrack.title} from queue`)
      }
      else {
        mediaData.queue.forEach((track, index) => {
          if (track.title.toLowerCase().includes(titleQuery)) {
            mediaData.queue.splice(index, 1)
            return message.channel.send(`🗑️ Removed ${track.title} from queue`)
          }
        })
      }
    } else {
      let trackIndex = Number(params[0])
      if (trackIndex < 0 || trackIndex > mediaData.queue.length) {
        return message.reply("Index must be greater than 0 and less than the total # of tracks in queue.")
      }
      const track = mediaData.queue[trackIndex]
      if (trackIndex == 0) 
        utils.removeAndEndTrack(mediaData)
      else 
        mediaData.queue.splice(trackIndex, 1)

      return message.channel.send(`🗑️ Removed ${track.title} from queue`)
    }
  }
}
