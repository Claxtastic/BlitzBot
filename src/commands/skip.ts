import * as Discord from "discord.js";
import { IBotCommand } from "../api";
import { mediaData } from "../index";

export default class skip implements IBotCommand {

    private readonly _command: string = "skip";

    help(): string {
        return "Skip the currently playing track.";
    }    
    
    isThisCommand(command: string): boolean {
        return command === this._command;
    }

    executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client) {
        if (mediaData.streamDispatcher === undefined || mediaData === undefined) { 
            return msgObject.reply("No track is playing!");
        } else {
            mediaData.streamDispatcher.end("Track skipped with !skip");
            return msgObject.channel.send(":fast_forward: **Track skipped!**");
        }
    }
}