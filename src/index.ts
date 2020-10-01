import * as Discord from "discord.js"
import * as ConfigFile from "./config"
import changelog from "./commands/changelog"
import { IBotCommand } from "./api"
import { Track } from "./model/Track"
import { Logger } from "tslog"

const client: Discord.Client = new Discord.Client()

const commands: IBotCommand[] = []

loadCommands(`${__dirname}/commands`)

class MediaData {
    public queue?: Array<Track>
    public streamDispatcher?: Discord.StreamDispatcher
}

// properties will be assigned once a queue has began from the play command
export const mediaData = new MediaData()
export const log = new Logger({minLevel: "info"})

client.on("ready", () => {
    console.log
    (`  ____  _ _ _       ____        _   \n |  _ \\| (_) |     |  _ \\      | |  \n | |_) | |_| |_ ___| |_) | ___ | |_ \n |  _ <| | | __|_  /  _ < / _ \\| __|\n | |_) | | | |_ / /| |_) | (_) | |_ \n |____/|_|_|\\__/___|____/ \\___/ \\__|`)
    if (client.user)
        client.user.setPresence({ activity: { name: "" } })

    // check if flag to send changelog on startup is set 
    if (process.argv[2] === "-c") {
        if (process.argv[3]) {
            changelog.sendChangelogOnStartup(client, process.argv[3])
        }
    }
})

/* Command Handler */
client.on("message", msg => {
    if (msg.author.bot) return
    if (!msg.content.startsWith(ConfigFile.config.prefix)) return

    handleCommand(msg)
})

async function handleCommand(msg: Discord.Message) {
    const command = msg.content.split(" ")[0].replace(ConfigFile.config.prefix, "")
    
    // everything after prefix
    const args = msg.content.split(" ").slice(1)

    for (const commandClass of commands) {
        try {
            if (!commandClass.isThisCommand(command)) {
                continue
            }

            await commandClass.executeCommand(args, msg, client)      
        } catch (exception) {
            console.log(exception)
        }
    }
}

function loadCommands(commandsPath: string) {

    if (ConfigFile.config.discordToken === "" || ConfigFile.config.youtubeToken === "") {
        ConfigFile.config.discordToken = process.env.discordToken as string
        ConfigFile.config.youtubeToken = process.env.youtubeToken as string
    }

    for (const commandName of ConfigFile.config.commands as string[]) {
        const commandsClass = require(`${commandsPath}/${commandName}`).default
        const command = new commandsClass() as IBotCommand
        commands.push(command)
    }
}

client.login(ConfigFile.config.discordToken)
