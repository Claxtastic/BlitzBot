import * as Discord from "discord.js"
import { IBotCommand } from "../api"
import { mediaData } from "../index"

export default class pause implements IBotCommand {

    private readonly command: string = "pause"

    help(): string[] {
        return ["pause", "Pauses the currently playing track."]
    }

    isThisCommand(command: string): boolean {
        return command === this.command    
    }

    executeCommand(params: string[], message: Discord.Message, client: Discord.Client) {
        if (mediaData.streamDispatcher != undefined && mediaData.queue != undefined) {
            if (mediaData.queue.length >= 1) {
                mediaData.streamDispatcher.pause()
                return message.react("⏸")
            } else {
                return message.reply("No track is playing!")
            }
        }
    }
}
