import * as Discord from "discord.js";
import { IBotCommand } from "../api";
import { mediaData } from "../index";

export default class resume implements IBotCommand {

    private readonly _command: string = "resume";

    help(): string[] {
        return ["resume", "Resume playing the current track."];
    }

    isThisCommand(command: string): boolean {
        return command === this._command;
    }

    executeCommand(params: string[], message: Discord.Message, client: Discord.Client) {
        if (mediaData.streamDispatcher != undefined && mediaData.queue != undefined) {
            if (mediaData.queue.length >= 1) {
                mediaData.streamDispatcher.resume();
                return message.react("▶");
            } else {
                return message.reply("No track is playing!");
            }
        }
    }
}
