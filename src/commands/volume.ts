import * as Discord from "discord.js"
import { IBotCommand } from "../api"
import * as ConfigFile from "../config"
import { mediaData } from ".."
import { constants } from "../constants"

export default class volume implements IBotCommand {

    private readonly command = "volume" 

    help(): string[] {
        return ["volume", `Change the volume of the current track, or use "volume default x" to change the default volume for all tracks. Value must be from 0.1 to 2.`]
    }    
    
    isThisCommand(command: string): boolean {
        return command === this.command
    }
    
    async executeCommand(params: string[], message: Discord.Message, client: Discord.Client) {

        const embed: Discord.MessageEmbed = new Discord.MessageEmbed()
        if (params.length < 1) {
            embed
                .setTitle("Current default volume")
                .setDescription(`Default volume is set to: \`${ConfigFile.config.volume}\``)
                .setColor(constants.YELLOW)
            return await message.channel.send(embed)
        }

        const defaultFlag: string = params[0]
        if (defaultFlag === "default") {
            if (params.length < 2 || !this.isValidVolume(+params[1])) {
                return await message.channel.send(this.badInput(embed))
            } else {
                ConfigFile.config.volume = +params[1]
                return await message.channel.send(embed
                  .setTitle("Default volume set")
                  .setDescription(`Set new default volume to \`${+params[1]}\``)
                  .setColor(constants.YELLOW))
            }
        }

        if (this.isValidVolume(+params[0])) {
            if (mediaData.queue === undefined || mediaData.queue.length === 0) {
                // no track is playing
                return await message.channel.send(embed
                    .setTitle("No track is playing")
                    .setDescription(`Can't change volume, no track is playing. Use \`volume default x\` to change the default volume.`)
                    .setColor(constants.YELLOW))
            } else {
                mediaData?.streamDispatcher?.setVolume(+params[0])
                return await message.channel.send(embed
                  .setTitle("Changed volume")
                  .setDescription(`Changed volume for this track to \`${+params[0]}\``)
                  .setColor(constants.YELLOW))
            }
        } else {
            return await message.channel.send(this.badInput(embed))
        }
    }

    isValidVolume(volume: number): boolean {
        return !(isNaN(volume) || volume < 0.1 || volume > 2);
    }

    badInput(embed: Discord.MessageEmbed) {
        embed
            .setTitle("Invalid volume")
            .addField("`volume x`", "Set the volume of the current track between 0.1 and 2.")
            .addField("`volume default x`", "Set the default volume for all tracks between 0.1 and 2.")
            .setColor(constants.YELLOW)
        return embed
    }
}
