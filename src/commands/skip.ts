import * as Discord from "discord.js";
import { IBotCommand } from "../api";

export default class skip implements IBotCommand {

    private readonly _command: string = "skip";

    help(): string {
        // throw new Error("Method not implemented.");
        return "";
    }    
    
    isThisCommand(command: string): boolean {
        // throw new Error("Method not implemented.");
        return false;
    }

    executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client): void {
        // throw new Error("Method not implemented.");
    }
}