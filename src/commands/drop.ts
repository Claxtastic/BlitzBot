import * as Discord from "discord.js"
import { IBotCommand } from "../api"

export default class drop implements IBotCommand {

    private readonly command: string = "drop"

    help(): string[] {
        return ["drop", "Play a sound file."]
    }

    isThisCommand(command: string): boolean {
        return command === this.command
    }

    executeCommand(params: string[], message: Discord.Message, client: Discord.Client): void {
        
        // let voiceChannel: Discord.VoiceChannel = message.member.voiceChannel
    }
}