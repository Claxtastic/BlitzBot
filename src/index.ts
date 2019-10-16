import * as Discord from "discord.js";
import * as ConfigFile from "./config";
import { IBotCommand } from "./api";

const client: Discord.Client = new Discord.Client();

let commands: IBotCommand[] = [];

loadCommands(`${__dirname}/commands`);

// TODO:
// Object (maybe small class) for MediaData; queue: , isPlaying: , dispatcher: ,
// on skip: dispatcher.end() (see .events in play)

client.on("ready", () => {
    console.log("Ready to go");
})

/* Command Handler */
client.on("message", msg => {
    if (msg.author.bot) return;
    if (!msg.content.startsWith(ConfigFile.config.prefix)) return;

    handleCommand(msg);
})

async function handleCommand(msg: Discord.Message) {
    let command = msg.content.split(" ")[0].replace(ConfigFile.config.prefix, "");
    
    // everything after prefix
    let args = msg.content.split(" ").slice(1);

    for (const commandClass of commands) {
        try {
            if (!commandClass.isThisCommand(command)) {
                continue;
            }

            await commandClass.executeCommand(args, msg, client);        
        } catch (exception) {
            console.log(exception);
        }
    }
}

function loadCommands(commandsPath: string) {

    if (!ConfigFile.config || (ConfigFile.config.commands as string[]).length === 0) return;

    for (const commandName of ConfigFile.config.commands as string[]) {
        const commandsClass = require(`${commandsPath}/${commandName}`).default;
        const command = new commandsClass() as IBotCommand;
        commands.push(command);
    }
}

client.login(ConfigFile.config.token);