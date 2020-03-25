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

    executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client): void {
        if (msgObject.member.voiceChannel && !msgObject.guild.voiceConnection)
            msgObject.member.voiceChannel.join();
            msgObject.react("🙋‍♂️");
    }
}