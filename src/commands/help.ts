import * as Discord from "discord.js"
import { IBotCommand } from "../api"
import * as ConfigFile from "../config"
import { constants } from "../constants"

export default class help implements IBotCommand {

    private command = "help"

    help(): string[] {
        return ["help", "Display this text."]
    }    
    
    isThisCommand(command: string): boolean {
        return command === this.command
    }

    executeCommand(params: string[], message: Discord.Message, client: Discord.Client): void {

        const embed: Discord.MessageEmbed = new Discord.MessageEmbed()
            .setTitle("**__BlitzBot Manual__**")
            .setColor(constants.YELLOW)
            
        for (const commandName of ConfigFile.config.commands as string[]) {
            const commandsClass = require(`${`${__dirname}`}/${commandName}`).default
            const command = new commandsClass() as IBotCommand
            embed.addField(command.help()[0], command.help()[1])
        }
        
        message.channel.send(embed)
    }
}