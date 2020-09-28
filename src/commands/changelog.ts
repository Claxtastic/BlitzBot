import * as Discord from "discord.js";
import { IBotCommand } from "../api";
import fs from "fs";
import path from "path";

const pkg = require("../../package.json")
export default class changelog implements IBotCommand {

    private readonly _command: string = "changelog";

    help(): string[] {
        return ["changelog", "Show the most recent changelog."];
    }

    isThisCommand(command: string): boolean {
        return command === this._command;
    }

    executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client): void {
        changelog.executeCommand(params, msgObject, client)
    }

    static executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client): void {
        const embed: Discord.MessageEmbed = this.createChangelogEmbed()

        const pogDraw = msgObject.guild.emojis.cache.find(emoji => emoji.name === "PogDraw")
        msgObject.channel.send(embed).then(sentEmbed => sentEmbed.react(pogDraw))
    }

    static createChangelogEmbed(): Discord.MessageEmbed {
        const embed = new Discord.MessageEmbed()
        const filepath = path.join(__dirname, "..", "..", "changelog.txt")
        const fullChangelog = fs.readFileSync(filepath, "utf8")

        const currentVersionHeader = `## [${pkg.version}]`
        const currentVersionFooter = "###"

        const currentVersion = fullChangelog.substring(fullChangelog.indexOf(currentVersionHeader) + currentVersionHeader.length,
            fullChangelog.lastIndexOf(currentVersionFooter))

        embed
            .setTitle(`BlitzBot v${pkg.version}`)
            .setDescription(`${currentVersion}`)
            .setColor("#d59363");
        return embed
    }

    static sendChangelogOnStartup(client: Discord.Client, channelId: string) {
        const embed: Discord.MessageEmbed = this.createChangelogEmbed()

        const pogDraw = client.emojis.cache.find(emoji => emoji.name === "PogDraw")
        const channel = client.channels.cache.get(channelId);

        (channel as Discord.TextChannel).send(embed).then(sentEmbed => sentEmbed.react(pogDraw))
    }
}