import * as Discord from "discord.js"
import { IBotCommand } from "../api"

export default class join implements IBotCommand {

    private readonly command = "join"

    help(): string[] {
        return ["join", "Make bot join the currently connected voice channel."]
    }    
    
    isThisCommand(command: string): boolean {
        return command === this.command
    }

    async executeCommand(params: string[], message: Discord.Message, client: Discord.Client) {
        if (message.member && !message.guild?.voice?.channel) {
            if (message.member.voice.channel) {
                await message.member.voice.channel.join()
                await message.react("🙋‍♂️")
            } else {
                await message.reply("You must join a voice channel before telling the bot to join!")
            }
        }
    }
}