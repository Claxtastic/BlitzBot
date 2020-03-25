import * as Discord from "discord.js";
import * as ConfigFile from "../config";
import { IBotCommand } from "../api";

export default class restart implements IBotCommand {

    private readonly _command: string = "restart";

    help(): string[] {
        return ["restart", "Fully restart the bot (might resolve any connection/playback issues)"];
    }

    isThisCommand(command: string): boolean {
        return command === this._command;
    }

    executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client) {
        msgObject.react("🔁")
        console.log("Killing connections and restarting ...");
        client.voiceConnections.forEach(connection => connection.disconnect());
        client.destroy();
        client.login(ConfigFile.config.discordToken);
    }
}
