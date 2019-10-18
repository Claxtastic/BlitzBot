import * as Discord from "discord.js";
import * as play from "./play";
import * as join from "./join";
import * as leave from "./leave";
import * as skip from "./skip";
import * as volume from "./volume";
import { IBotCommand } from "../api";

export default class help implements IBotCommand {

    private _command: string = "help";
    private _commandToHelpStringMap: Map<string, string> = new Map<string, string>()
        .set("play", play.default.prototype.help())
        .set("join", join.default.prototype.help())
        .set("leave", leave.default.prototype.help())
        .set("skip", skip.default.prototype.help())
        .set("volume", volume.default.prototype.help());

    help(): string {
        return "";
    }    
    
    isThisCommand(command: string): boolean {
        return command === this._command;
    }

    executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client): void {
        let embed: Discord.RichEmbed = new Discord.RichEmbed()
            .setTitle("**__BlitzBot Manual__**")
            .setColor("#d59363");
        this._commandToHelpStringMap.forEach((value: string, key: string) => {
            embed.addField(key, value);
        });
        msgObject.channel.send(embed);
    }
}