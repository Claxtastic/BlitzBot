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
    
    executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client) {
        if (msgObject.member && msgObject.guild?.voice?.channel) {
            if (msgObject.member.voice.channel) {
                if (mediaData.streamDispatcher != undefined)
                    mediaData.streamDispatcher.end();
                msgObject.member.voice.channel?.leave();
                return msgObject.react("👋");
            } else {
                return msgObject.reply("You must join a voice channel before telling the bot to leave!");
            }
        }
    }
}