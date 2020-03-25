import * as Discord from "discord.js";
import { IBotCommand } from "../api";
import { mediaData } from "../index";

export default class leave implements IBotCommand {

    private readonly _command = "leave";

    help(): string[] {
        return ["leave", "Make bot leave currently connected voice channel."];
    }    
    
    isThisCommand(command: string): boolean {
        return command === this._command;
    }
    
    executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client): void {
        if (msgObject.member.voiceChannel && msgObject.guild.voiceConnection) {
            if (mediaData.streamDispatcher != undefined) {
                mediaData.streamDispatcher.end("Received !leave command");
            }
            msgObject.member.voiceChannel.leave();
            msgObject.react("👋");
        }
    }
}