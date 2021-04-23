import { Message, Client } from "discord.js";
import { mediaData } from "..";
import { IBotCommand } from "../api";
import play from "./play";

export default class replay implements IBotCommand {

  private readonly commands = ["replay", "r"]

  help(): string[] {
    return ["replay", "Replays the last track."]
  }
  isThisCommand(command: string): boolean {
    return this.commands.includes(command)
  }
  executeCommand(params: string[], message: Message, client: Client) {
    if (mediaData.lastPlayed == null) return message.channel.send("No track has been played since the bot started.")
    
    if (mediaData.queue.length == 0) {
      mediaData.queue.push(mediaData.lastPlayed)
      new play().playTrack(mediaData.queue, client)
      return message.channel.send(`⏪ Replaying ${mediaData.lastPlayed.title}`)
    } 
    else {
      return message.reply("You can only replay the last track when nothing is playing.")
    }
  }
}
