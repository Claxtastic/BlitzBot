import * as Discord from "discord.js"
import {log, mediaData} from "../index"
import { IBotCommand } from "../api";
import {Track} from "../model/Track";
import utils from "../utils";

export default class seek implements IBotCommand {

  private readonly command = "seek"

  help(): string[] {
    return ["seek", "Seek to the specified timestamp in the currently playing track. Must provide a timestamp in the format `hh:mm:ss`."]
  }

  isThisCommand(command: string): boolean {
    return command === this.command
  }

  executeCommand(params: string[], message: Discord.Message, client: Discord.Client) {
    // get current track
    let track: Track = mediaData.queue[0]
    // modify its seek time
    track.seekTime = utils.getSecFromTimestamp(params[0])
    // place it on top of queue
    mediaData.queue.unshift(track)
    // end track, skip to the modified one
    mediaData.streamDispatcher.end()
    log.info(`Seeking to ${params[0]} in ${track.title}`)
  }
}
