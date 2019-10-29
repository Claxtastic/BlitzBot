import * as Discord from "discord.js";
import { IBotCommand } from "../api";

export default class testCommand implements IBotCommand {

    private readonly _command = "testCommand";

    help(): string[] {
        return ["testCommand", "Command used to test response from bot"];
    }

    isThisCommand(command: string): boolean {
        return command === this._command;
    }

    executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client): void {
        msgObject.channel.send("It's working");
    }
}