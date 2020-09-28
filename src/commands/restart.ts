import * as Discord from "discord.js"
import * as ConfigFile from "../config"
import { log } from "../index"
import { IBotCommand } from "../api"
import { mediaData } from ".."

export default class restart implements IBotCommand {

    private readonly _command: string = "restart"

    help(): string[] {
        return ["restart", "Fully restart the bot (might resolve any connection/playback issues)."]
    }

    isThisCommand(command: string): boolean {
        return command === this._command
    }

    executeCommand(params: string[], message: Discord.Message, client: Discord.Client) {
        log.info("Killing connections and restarting ...")

        client.voice?.connections.forEach(connection => connection.disconnect())
        mediaData.queue = undefined
        mediaData.streamDispatcher?.end()
        
        client.destroy()
        client.login(ConfigFile.config.discordToken).then(() => {
            message.react("🔁")
            log.info("Restarted successfully")
        })
    }
}
