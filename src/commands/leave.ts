import * as Discord from "discord.js";
import { IBotCommand } from "../api";

export default class leave implements IBotCommand {

    private readonly _command = "leave";

    help(): string[] {
        return ["leave", "Make bot leave currently connected voice channel."];
    }    
    
    isThisCommand(command: string): boolean {
        return command === this._command;
    }
    
    executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client): void {
        // TODO: Kill the queue and other cleanup
        if (msgObject.member.voiceChannel && msgObject.guild.voiceConnection) {
            msgObject.member.voiceChannel.leave();
            msgObject.reply("Bye bye very nasty");
        }
    }
}