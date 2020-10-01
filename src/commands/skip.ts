import * as Discord from "discord.js"
import { IBotCommand } from "../api"
import { mediaData, log } from "../index"
import { Track } from "../model/Track"

export default class skip implements IBotCommand {

    private readonly commands: string[] = ["skip", "s"]

    help(): string[] {
        return ["skip", "Skip the currently playing track, all tracks, or add a number to skip the next x tracks."]
    }    
    
    isThisCommand(command: string): boolean {
        return this.commands.includes(command)
    }

    executeCommand(params: string[], message: Discord.Message, client: Discord.Client) {
        if (mediaData.queue != undefined) {
            if (mediaData.queue.length === 0) { 
                return message.reply("No track is playing!")
            }
            if (mediaData.streamDispatcher != undefined) {
                if (params[0]) {
                    if (params[0] === "all") {
                        const numberOfTracksToSkip: number = mediaData.queue.length
                        log.info(`Skipping all tracks (${numberOfTracksToSkip})`)
                        for (var i = 0; i < numberOfTracksToSkip; i++) {
                            mediaData.queue.shift()
                            mediaData.streamDispatcher.end()
                        }
                        return message.channel.send(`**Skipped all tracks in queue!** :fast_forward:`)
                    }
                    else if (parseInt(params[0]) != undefined) {
                        log.info(`Skipping next ${params[0]} tracks`)
                        for (var i = 0; i < parseInt(params[0])-1; i++) {
                            mediaData.queue.shift()
                            mediaData.streamDispatcher.end()
                        }
                        return message.channel.send(`**Skipped ${params[0]} tracks!** :fast_forward:`)
                    }
                } else {
                    const copiedQueue: Array<Track> = mediaData.queue.map(track => Object.assign({}, track))
                    const skippedTrack: string = copiedQueue.shift().title
                    mediaData.streamDispatcher.end()
                    return message.channel.send(`\`${skippedTrack}\` :fast_forward: **skipped!**`)
                }
            }
        }
    }
}