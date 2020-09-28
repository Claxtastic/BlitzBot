import * as Discord from "discord.js";

export interface IBotCommand {

    // help: return a 2 length string[], where [0] is the command name and [1] is the help string for that command
    help(): string[];

    // isThisCommand: check if the command string found in the Discord message is the same as this._command
    isThisCommand(command: string): boolean;

    // executeCommand: execute this command with the parameters found in the message, as well as a reference to the message 
    executeCommand(params: string[], message: Discord.Message, client: Discord.Client): void;
}