import * as Discord from "discord.js";
import { IBotCommand } from "../api";
import { mediaData } from "../index";

export class nowplaying implements IBotCommand {

    private readonly _command: string = "nowplaying";

    help(): string[] {
        return ["nowplaying", "Shows the currently playing track and its' link."];
    }    
    
    isThisCommand(command: string): boolean {   
        return command === this._command;
    }

    executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client) {
        if (mediaData.queue === undefined || mediaData === undefined) { 
            return msgObject.reply("No track is playing!");
        } else { 
            const track = mediaData.queue[0];
            const embed: Discord.RichEmbed = new Discord.RichEmbed()
                .setTitle("Now Playing")
                .setDescription(`[${track.url}](${track.title})`)
                .setThumbnail(track.thumbnail)
                .addField("Track Duration: ", `${track.duration}`);
            return msgObject.channel.send(embed);
        }
    }
}