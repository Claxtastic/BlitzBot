import * as Discord from "discord.js";
import { IBotCommand } from "../api";

export default class drop implements IBotCommand {

    private readonly _command: string = "drop";

    help(): string[] {
        return ["drop", "Play a sound file."];
    }

    isThisCommand(command: string): boolean {
        return command === this._command;
    }

    executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client) {

        // let voiceChannel: Discord.VoiceChannel = msgObject.member.voiceChannel;
    }
}