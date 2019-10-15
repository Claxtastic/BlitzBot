import * as Discord from "discord.js";

export interface IBotCommand {
    help(): string;

    isThisCommand(command: string): boolean;

    executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client): void;
}