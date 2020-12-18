import * as Discord from "discord.js"
import { IBotCommand } from "../api"

export default class testCommand implements IBotCommand {

    private readonly command = "ping"

    help(): string[] {
        return ["ping", "Pong."]
    }

    isThisCommand(command: string): boolean {
        return command === this.command
    }

    async executeCommand(params: string[], message: Discord.Message, client: Discord.Client) {
        await message.channel.send("Pong")
    }
}