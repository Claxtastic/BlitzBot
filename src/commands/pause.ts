import * as Discord from "discord.js";
import { IBotCommand } from "../api";
import { mediaData } from "../index";

export default class pause implements IBotCommand {

    private readonly _command: string = "pause";

    help(): string[] {
        return ["pause", "Pauses the currently playing track."];
    }

    isThisCommand(command: string): boolean {
        return command === this._command;    
    }

    executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client) {
        if (mediaData.streamDispatcher != undefined) {
            mediaData.streamDispatcher.pause();
            return msgObject.react("⏸");
        }
    }
}
