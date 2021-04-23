import * as Discord from "discord.js"
import { IBotCommand } from "../api"
import { constants } from "../constants"
import { mediaData } from "../index"
import { Track } from "../model/Track"

export default class queue implements IBotCommand {

  private readonly command: string = "queue"

  help(): string[] {
    return ["queue", "Show the next 10 queued tracks."]
  }

  isThisCommand(command: string): boolean {
    return command === this.command
  }

  executeCommand(params: string[], message: Discord.Message, client: Discord.Client) {
    if (mediaData.queue != undefined && mediaData.queue.length != 0) {
      return message.channel.send(this.createQueueEmbed(mediaData.queue))
    } else {
      return message.reply("No track is playing!")
    }
  }

  createQueueEmbed(queue: Array<Track>): Discord.MessageEmbed {
    const copiedQueue: Array<Track> = queue.map(x => Object.assign({}, x))
    const embed: Discord.MessageEmbed = new Discord.MessageEmbed()
      .setTitle("Queue")
      .setColor(constants.YELLOW)
    let position = 0
    copiedQueue.forEach(track => {
      embed.addField(position, `\`\`\`${track.title}\`\`\``, true)
      position++
      if (position >= 10) {
        embed.setFooter(`...and ${copiedQueue.length - 10} more tracks`)
        return embed
      }
    })
    return embed
  }
}
