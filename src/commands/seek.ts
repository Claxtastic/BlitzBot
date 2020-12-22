import * as Discord from "discord.js"
import {log, mediaData} from "../index"
import { IBotCommand } from "../api";

export default class seek implements IBotCommand {

  private readonly command = "seek"

  static getSecFromTimestamp(timestamp: String): number {
    let splitTimestamp = timestamp.split(":")
    let hoursSec = parseInt(splitTimestamp[0]) * 60 * 60
    let minutesSec = parseInt(splitTimestamp[1]) * 60
    return hoursSec + minutesSec + parseInt(splitTimestamp[2])
  }

  help(): string[] {
    return ["seek", "Seek to the specified timestamp in the currently playing track. Must provide a timestamp in the format `hh:mm:ss`."]
  }

  isThisCommand(command: string): boolean {
    return command === this.command
  }

  executeCommand(params: string[], message: Discord.Message, client: Discord.Client) {
    // TODO:
    //  1. get current track
    //  2. save current seek in track
    //  3. place new track at top of queue with new seek
    //  4. if failed, return to old seek
  }
}
