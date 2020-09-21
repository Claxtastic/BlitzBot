import * as Discord from "discord.js"
import * as ConfigFile from "../config"
import { get } from "request-promise"
import { mediaData } from "../index"
import { IBotCommand } from "../api"
import { Track } from "../model/Track"
import { SoundcloudTrack } from "../model/SoundcloudTrack"

export let queue = Array<Track>()
export const streamOptions = { seek: 0 }
export default class play implements IBotCommand {

    private readonly ytdl = require('ytdl-core')
    private readonly Youtube = require('simple-youtube-api');

    private readonly command: string = "play"  
    private readonly youtubeAPI = new this.Youtube(ConfigFile.config.youtubeToken)

    private readonly soundcloudToken: string = "71dfa98f05fa01cb3ded3265b9672aaf"
    private readonly highWaterMarkLong: number = 1
    private readonly highWaterMarkShort: number = 1 << 25
    private readonly youtubeBaseUrl: string = "https://youtube.com/watch?v="
    
    private idleTimer: any
    private textChannel: Discord.TextChannel | undefined
    
    help(): string[] {
        return ["play", "Play a YouTube link, the 1st result of a YouTube search, or a Soundcloud link."]
    }

    isThisCommand(command: string): boolean { 
        return command === this.command
    }

    formatVideoDuration(durationObject: any): string {
        let hoursBit: string = ""
        // if video is hours long, include if video hours < 10, add leading zero
        // else, video is not hours long, empty string
        if (durationObject.hours) {
            hoursBit = `${durationObject.hours}:`
            if (durationObject.hours < 10) {
                hoursBit = "0" + hoursBit
            }
        }
        return `
            ${hoursBit
            }${
                durationObject.minutes < 10 
                    ? "0" + durationObject.minutes : durationObject.minutes
                    ? durationObject.minutes : "00"
            }:${
                durationObject.seconds < 10
                    ? "0" + durationObject.seconds : durationObject.seconds
                    ? durationObject.seconds : "00"
            }
        `
    }

    formatSoundcloudDuration(ms: number): string {
        const hours: number = Math.floor(((ms / (1000*60*60)) % 24))
        const minutes: number = Math.floor(((ms / (1000*60)) % 60))
        const seconds: number = Math.floor((ms / 1000) % 60)
        let hoursBit: string = ""
        if (hours > 0) {
            hoursBit = `${hours}:`
            if (hours < 10) {
                hoursBit = "0" + hoursBit
            }
        }
        return `
            ${hoursBit
            }${
                minutes < 10
                    ? "0" + minutes : minutes
                    ? minutes : "00"
            }:${
                seconds < 10
                    ? "0" + seconds : seconds
                    ? seconds : "00"
            }
        `
    }

    createPlayResponse(track: any): Discord.MessageEmbed {
        const embed: Discord.MessageEmbed = new Discord.MessageEmbed()
        if (mediaData.queue?.length === 1 || mediaData.queue?.length === 0) {
            embed.setTitle("Playing track")
        } else {
            embed.setTitle("Track added to queue")
        }
        
        embed
            .setColor("#c4302b")
            .setThumbnail(track.thumbnail)
            .setDescription(`${track.title} added to queue \n ${track.url}`)
            .addField("Track Duration: ", `${track.duration}`) 
        return embed
    }

    async executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client) {
        /* Handle the message we received by checking what type of query it is */

        if (!msgObject.member?.voice || !msgObject.member.voice.channel) {
            return msgObject.reply("You must join a voice channel before playing!")
        }
        
        let voiceChannel: Discord.VoiceChannel = msgObject.member.voice.channel
        // save the text channel in case we have to send any errors
        this.textChannel = msgObject.channel as Discord.TextChannel
        let query: string = params[0]
        
        // the metadata of the track being played
        let track: Track

        // if query is a YouTube URL
        if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {

            // if query is a YouTube Playlist URL
            if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/playlist.+/)) {
                const playlist = this.youtubeAPI.getPlaylistById(query, (error, result) => { 
                    if (error) {
                        return msgObject.reply(error)
                    }
                    console.log(result)
                })
                // const videos = await playlist.getVideos()

                // videos.array.forEach(async (videoObj: any) => {
                //     const video = await this.youtubeAPI.getVideoByID(videoObj.id)
                //     console.log(video)
                //     return msgObject.reply(video)
                // }) 
            }

            // else query is Single Youtube URL
            else {
                const url: string = query
                let queryParts: string[] = query
                    .replace(/(>|<)/gi, '')
                    .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)

                // the youtube video /watch? ID
                const id: string = queryParts[2].split(/[^0-9a-z_\-]/i)[0]

                track = await this.handleYoutubeUrl(id, voiceChannel)  
            }
        }

        // if query is a Soundcloud URL
        else if (query.match(/^(http(s)?:\/\/)?((w){3}.)?soundcloud(\.com)?\/.+/)) {
            track = await this.handleSoundcloudTrack(query, voiceChannel)
        }

        // else play argument was a YouTube search query
        else {
            // TODO: remove try ?
            try {
                query = params.join(" ")

                track = await this.handleYoutubeQuery(query, voiceChannel)
            } catch (exception) { console.log(exception); msgObject.channel.send(`Received error from YouTube: ${exception}`) }
        }

        queue.push(track)
        mediaData.queue = queue
        
        try {
            let embed: Discord.MessageEmbed = this.createPlayResponse(track)
            if (mediaData.queue.length === 1) {
                msgObject.channel.send(embed)
                return this.playTrack(queue, client)
            } else {
                return msgObject.channel.send(embed)
            }
        } catch (exception) { msgObject.channel.send(`Error playing track from bot: ${exception}`) }
    }

    /** Handle a single Youtube url **/
    async handleYoutubeUrl(id: string, voiceChannel: Discord.VoiceChannel): Promise<Track> {
        console.log("Query is single Youtube video")

        const youtubeVideo = await this.youtubeAPI.getVideoByID(id)

        const track = {
            url: youtubeVideo.url,
            title: youtubeVideo.title,
            duration: this.formatVideoDuration(youtubeVideo.duration),
            durationMs: youtubeVideo.duration,
            thumbnail: youtubeVideo.thumbnails.high.url,
            voiceChannel: voiceChannel
        } as Track

        return youtubeVideo ? track : Promise.reject(new Error())
    }

    /** Handle Youtube query **/
    async handleYoutubeQuery(query: string, voiceChannel: Discord.VoiceChannel): Promise<Track> {
        console.log("Query is a Youtube query")

        // get one video (top result) from the search query
        // let ytResult: YtResult
        // await this.youtubeAPI.search(query, 1, Object, (error: Error, result: YtResult) => {
        //     error ? console.log(error) : ytResult = result
        // })

        // if (typeof ytResult !== undefined) {
        //     let youtubeVideo = ytResult.items[0]
        //     return {
        //         url: this.youtubeBaseUrl + youtubeVideo.id,
        //         title: youtubeVideo.snippet!.title,
        //         duration: this.formatVideoDuration(youtubeVideo.contentDetails!.duration),
        //         durationMs: 0,
        //         thumbnail: youtubeVideo.snippet!.thumbnails!.default!.url,
        //         voiceChannel: voiceChannel
        //     } as Track
        // }
        return Promise.reject(new Error())
    }

    /** Handle a Youtube playlist query **/
    handleYoutubePlaylist() {

    }

    /** Handle a Soundcloud track query **/
    async handleSoundcloudTrack(query: string, voiceChannel: Discord.VoiceChannel): Promise<Track> {
        return await get("http://api.soundcloud.com/resolve.json?url=" + query + "&client_id=" + this.soundcloudToken)
            .then(body => {
                let response = JSON.parse(body)
                return {
                    url: response.permalink_url,
                    title: response.title,
                    duration: this.formatSoundcloudDuration(response.duration),
                    durationMs: response.duration,
                    thumbnail: response.user.avatar_url,
                    voiceChannel: voiceChannel,
                    streamUrl: "http://api.soundcloud.com/tracks/" + response.id + "/stream?consumer_key=71dfa98f05fa01cb3ded3265b9672aaf"
                } as SoundcloudTrack
            })
            .catch((err: Error) => {
                console.log(err)
                return Promise.reject(err)
            })
    }

    async getPlayFunction(track: any, connection: Discord.VoiceConnection)  {
        if (track.type === "youtube") {
            let highWaterMark: number
            // use a lower highWaterMark if the video is >= 45 min
            track.durationMs >= 2700000 ? highWaterMark = this.highWaterMarkLong : highWaterMark = this.highWaterMarkShort
            return connection.play(await this.ytdl(queue[0].url, { quality: "highestaudio", highWaterMark: highWaterMark }))
        } else {
            return connection.play(track.streamUrl)
        }
    }

    startIdleTimeout(client: Discord.Client, voiceChannel: Discord.VoiceChannel) {
        console.log("Starting sleep ... ")
        this.idleTimer = setTimeout(() => 
        {
            client.voice?.connections.forEach(connection => {
                if (connection.channel === voiceChannel) {
                    console.log("Going idle")
                    connection.disconnect()
                }
            })
        },
        900000)
    }

    endIdleTimeout() {
        clearTimeout(this.idleTimer)
    }

    playTrack(queue: Array<any>, client: Discord.Client) {
        let voiceChannel: Discord.VoiceChannel
        
        queue[0].voiceChannel
            .join().then(async (connection: Discord.VoiceConnection) => {
                const dispatcher: Discord.StreamDispatcher = (await this.getPlayFunction(queue[0], connection))
                    .on("start", () => {
                        this.endIdleTimeout()
                        dispatcher.setVolume(ConfigFile.config.volume)
                        // save dispatcher so that it can be accessed by skip and other commands
                        mediaData.streamDispatcher = dispatcher
                        voiceChannel = queue[0].voiceChannel
                        client?.user?.setPresence({ activity: { name: queue[0].title } })
                    })
                    .on("finish", () => {
                        queue.shift()
                        client?.user?.setPresence({ activity: { name: "" } })
                        if (queue.length >= 1) {
                            console.log("Playing next track")
                            return this.playTrack(queue, client)
                        } else {
                            this.startIdleTimeout(client, voiceChannel)
                        }
                    })
                    .on("error", (e: Error) => {
                        // graceful recovery skip the erroring track
                        this.textChannel?.send(`Error playing the track \`${queue[0].title}\` \nThis could be an error with the source track, but it might be worth trying again\nVerbose error: \`\`\`${e}\`\`\``)
                        mediaData?.streamDispatcher?.end()
                        return console.log(e)
                    })
            })
    }
}
