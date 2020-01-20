import * as Discord from "discord.js";
import { IBotCommand } from "../api";
import { streamOptions } from "./play";

export default class volume implements IBotCommand {

    private readonly _command = "volume"; 

    help(): string[] {
        return ["volume", "Set the volume between 1 - 10, or display the current volume."];
    }    
    
    isThisCommand(command: string): boolean {
        return command === this._command;
    }
    
    executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client) {

        const embed: Discord.RichEmbed = new Discord.RichEmbed();
        if (params.length < 1) {
            embed
                .setTitle("Current volume")
                .setDescription(`Volume is set to: \`${streamOptions.volume}\``)
                .setColor("#d59363");
            return msgObject.channel.send(embed);
        }

        const volume: number = +params[0];
        if (isNaN(volume) || volume === 0 || volume > 10) {
            embed
                .setTitle("Invalid volume")
                .setDescription("Enter a number 1 - 10.")
                .setColor("#d59363");
                return msgObject.channel.send(embed);
        }
        streamOptions.volume = volume;
        embed
            .setTitle("Volume set")
            .setDescription(`Set volume to \`${streamOptions.volume}\``)
            .setColor("#d59363");
       return msgObject.channel.send(embed);
    }
}