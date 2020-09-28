import * as Discord from "discord.js";
import { IBotCommand } from "../api";

export default class join implements IBotCommand {

    private readonly _command = "join";

    help(): string[] {
        return ["join", "Make bot join the currently connected voice channel."];
    }    
    
    isThisCommand(command: string): boolean {
        return command === this._command;
    }

    executeCommand(params: string[], message: Discord.Message, client: Discord.Client) {
        if (message.member && !message.guild?.voice?.channel) {
            if (message.member.voice.channel) {
                message.member.voice.channel.join();
                message.react("🙋‍♂️");
            } else {
                return message.reply("You must join a voice channel before telling the bot to join!");
            }
        }
    }
}