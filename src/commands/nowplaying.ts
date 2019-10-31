import * as Discord from "discord.js";
import { IBotCommand } from "../api";
import { mediaData } from "../index";

export default class nowplaying implements IBotCommand {

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
            if (track === undefined) 
                return msgObject.reply("No track isplaying!");
            const embed: Discord.RichEmbed = new Discord.RichEmbed()
                .setAuthor("Now Playing", client.user.avatarURL)
                .setTitle(track.title)
                .setURL(track.url)
                .setThumbnail(track.thumbnail)
                .addField("Track Duration: ", `${track.duration}`)
                .setColor("#d59363");
                // TODO: add track duration progress to this embed
            return msgObject.channel.send(embed);
        }
    }
}