import * as Discord from "discord.js";
import * as Play from "./play";
import { IBotCommand } from "../api";
// import MediaData as MediaData from "../index";

export default class skip implements IBotCommand {

    private readonly _command: string = "skip";

    help(): string {
        // throw new Error("Method not implemented.");
        return "";
    }    
    
    isThisCommand(command: string): boolean {
        return command === this._command;
    }

    executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client): void {
        // throw new Error("Method not implemented.");
        let currentQueue: Array<any> = Play.queue;
        
        console.log(currentQueue[0].title);
        console.log(currentQueue.length);
        // TODO: Report skipped track to play.ts
        currentQueue.shift();
    }
}