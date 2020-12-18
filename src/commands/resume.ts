import * as Discord from "discord.js"
import { IBotCommand } from "../api"
import { mediaData } from "../index"

export default class resume implements IBotCommand {

    private readonly command: string = "resume"

    help(): string[] {
        return ["resume", "Resume playing the current track."]
    }

    isThisCommand(command: string): boolean {
        return command === this.command
    }

    async executeCommand(params: string[], message: Discord.Message, client: Discord.Client) {
        if (mediaData.streamDispatcher != undefined && mediaData.queue != undefined) {
            if (mediaData.queue.length >= 1) {
                mediaData.streamDispatcher.resume()
                await message.react("▶")
            } else {
                await message.reply("No track is playing!")
            }
        }
    }
}
