import * as Discord from "discord.js"
import { IBotCommand } from "../api"
import { mediaData } from "../index"

export default class leave implements IBotCommand {

    private readonly command = "leave"

    help(): string[] {
        return ["leave", "Make bot leave currently connected voice channel."]
    }    
    
    isThisCommand(command: string): boolean {
        return command === this.command
    }
    
    async executeCommand(params: string[], message: Discord.Message, client: Discord.Client) {
        if (message.member && message.guild?.voice?.channel) {
            if (message.member.voice.channel) {
                if (mediaData.streamDispatcher != undefined)
                    mediaData.streamDispatcher.end()
                message.member.voice.channel?.leave()
                await message.react("👋")
            } else {
                await message.reply("You must join a voice channel before telling the bot to leave!")
            }
        }
    }
}