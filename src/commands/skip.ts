import * as Discord from "discord.js";
import { IBotCommand } from "../api";
import { mediaData } from "../index";

export default class skip implements IBotCommand {

    private readonly _command: string = "skip";

    help(): string[] {
        return ["skip", "Skip the currently playing track."];
    }    
    
    isThisCommand(command: string): boolean {
        return command === this._command;
    }

    executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client) {
        if (mediaData.queue != undefined) {
            if (mediaData.queue.length === 0) { 
                return msgObject.reply("No track is playing!");
            }
            if (mediaData.streamDispatcher != undefined) {
                const copiedQueue: Array<any> = mediaData.queue.map(track => Object.assign({}, track));
                let skippedTrack: string = copiedQueue.shift().title;
                // this is silly, but for some reason a paused track won't be skipped without it.
                mediaData.streamDispatcher.resume();
                mediaData.streamDispatcher.end();
                return msgObject.channel.send(`\`${skippedTrack}\` :fast_forward: **skipped!**`);
            }
        }
    }
}