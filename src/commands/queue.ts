import * as Discord from "discord.js";
import { IBotCommand } from "../api";
import { mediaData } from "../index";

export default class queue implements IBotCommand {

    private readonly _command: string = "queue";

    help(): string[] {
        return ["queue", "Show the first 10 queued tracks."];
    }

    isThisCommand(command: string): boolean {
        return command === this._command;
    }

    executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client) {
        if (mediaData.queue != undefined && mediaData.queue.length != 0) {
            return msgObject.channel.send(this.createQueueEmbed(mediaData.queue));
        } else {
            return msgObject.reply("No track is playing!");
        }
    }

    createQueueEmbed(queue: Array<any>): Discord.RichEmbed {
        const copiedQueue: Array<any> = queue.map(x => Object.assign({}, x));
        const embed: Discord.RichEmbed = new Discord.RichEmbed()
                .setTitle("Queue") 
                .setColor("#d59363");
        let position: number = 1;
        copiedQueue.forEach(track => {
            embed.addField(position, `\`\`\`${track.title}\`\`\``, true);
            position++;
            if (position >= 10) {
                embed.setFooter(`...and ${copiedQueue.length - 10} more tracks`);
                return embed;
            }
        });
        return embed;
    }
}