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

    executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client) {
        if (msgObject.member && !msgObject.guild?.voice?.channel) {
            if (msgObject.member.voice.channel) {
                msgObject.member.voice.channel.join();
                msgObject.react("🙋‍♂️");
            } else {
                return msgObject.reply("You must join a voice channel before telling the bot to join!");
            }
        }
    }
}