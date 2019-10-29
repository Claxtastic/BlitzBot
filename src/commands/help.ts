import * as Discord from "discord.js";
import { IBotCommand } from "../api";
import * as ConfigFile from "../config";

export default class help implements IBotCommand {

    private _command: string = "help";

    help(): string[] {
        return ["help", "Display this text."];
    }    
    
    isThisCommand(command: string): boolean {
        return command === this._command;
    }

    executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client): void {

        let embed: Discord.RichEmbed = new Discord.RichEmbed()
            .setTitle("**__BlitzBot Manual__**")
            .setColor("#d59363");
            
        for (const commandName of ConfigFile.config.commands as string[]) {
            const commandsClass = require(`${`${__dirname}`}/${commandName}`).default;
            const command = new commandsClass() as IBotCommand;
            embed.addField(command.help()[0], command.help()[1]);
        }
        
        msgObject.channel.send(embed);
    }
}