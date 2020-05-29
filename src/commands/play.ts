import * as Discord from "discord.js";
import * as ConfigFile from "../config";
import { get } from "request-promise";
import { mediaData } from "../index";
import { IBotCommand } from "../api";

export let queue = Array<any>();
export const streamOptions = { seek: 0 };
export default class play implements IBotCommand {

    private readonly ytdl = require('ytdl-core');
    private readonly Youtube = require('simple-youtube-api');

    private readonly _command: string = "play";  
    private readonly _youtubeAPI = new this.Youtube(ConfigFile.config.youtubeToken)
    private readonly _soundcloudToken: string = "71dfa98f05fa01cb3ded3265b9672aaf";
    private readonly _highWaterMarkLong: number = 1;
    private readonly _highWaterMarkShort: number = 1 << 25;
    
    private _idleTimer: any;
    private _textChannel: Discord.TextChannel | undefined;
    
    help(): string[] {
        return ["play", "Play a YouTube link, the 1st result of a YouTube search, or a Soundcloud link."];
    }

    isThisCommand(command: string): boolean { 
        return command === this._command;
    }

    getYoutubeInfo(youtubeVideo: any, voiceChannel: Discord.VoiceChannel): Object {
        return {
            title: youtubeVideo.title,
            url: youtubeVideo.url,
            duration: this.formatVideoDuration(youtubeVideo.duration),
            durationMs: youtubeVideo.duration,
            thumbnail: youtubeVideo.thumbnails.high.url,
            voiceChannel: voiceChannel,
            type: "youtube"
        };
    }

    getSoundcloudInfo(soundcloudTrack: any, voiceChannel: Discord.VoiceChannel): Object {
        return {
            title: soundcloudTrack.title,
            streamUrl: "http://api.soundcloud.com/tracks/" + soundcloudTrack.id + "/stream?consumer_key=71dfa98f05fa01cb3ded3265b9672aaf",
            url: soundcloudTrack.permalink_url,
            duration: this.formatSoundcloudDuration(soundcloudTrack.duration),
            durationMs: soundcloudTrack.duration,
            thumbnail: soundcloudTrack.user.avatar_url,
            voiceChannel: voiceChannel,
            type: "soundcloud"
        };
    }

    formatVideoDuration(durationObject: any): string {
        let hoursBit: string = "";
        // if video is hours long, include; if video hours < 10, add leading zero
        // else, video is not hours long, empty string
        if (durationObject.hours) {
            hoursBit = `${durationObject.hours}:`;
            if (durationObject.hours < 10) {
                hoursBit = "0" + hoursBit;
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
        `;
    }

    formatSoundcloudDuration(ms: number): string {
        const hours: number = Math.floor(((ms / (1000*60*60)) % 24));
        const minutes: number = Math.floor(((ms / (1000*60)) % 60));
        const seconds: number = Math.floor((ms / 1000) % 60);
        let hoursBit: string = "";
        if (hours > 0) {
            hoursBit = `${hours}:`;
            if (hours < 10) {
                hoursBit = "0" + hoursBit;
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
        `;
    }

    createPlayResponse(track: any): Discord.MessageEmbed {
        const embed: Discord.MessageEmbed = new Discord.MessageEmbed();
        if (mediaData.queue?.length === 1 || mediaData.queue?.length === 0) {
            embed.setTitle("Playing track")
        } else {
            embed.setTitle("Track added to queue")
        }
        
        embed
            .setColor("#c4302b")
            .setThumbnail(track.thumbnail)
            .setDescription(`${track.title} added to queue \n ${track.url}`)
            .addField("Track Duration: ", `${track.duration}`); 
        return embed;
    }

    async executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client) {
        /* Handle the message we received by checking what type of query it is */

        if (!msgObject.member?.voice || !msgObject.member.voice.channel) {
            return msgObject.reply("You must join a voice channel before playing!");
        }
        
        let voiceChannel: Discord.VoiceChannel = msgObject.member.voice.channel;
        // save the text channel in case we have to send any errors
        this._textChannel = msgObject.channel as Discord.TextChannel;
        let query: string = params[0];
        
        // the response from Youtube or Soundcloud
        let response: any;
        // the metadata of the track being played
        let track;

        // if query is a YouTube URL
        if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
            const url: string = query;

            try {
                let queryParts: string[] = query
                    .replace(/(>|<)/gi, '')
                    .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);

                // the youtube video /watch? ID
                const id: string = queryParts[2].split(/[^0-9a-z_\-]/i)[0];
                // youtube video object
                response = await this._youtubeAPI.getVideoByID(id);
                track = this.getYoutubeInfo(response, voiceChannel);
            } catch (exception) { console.log(`Received error from YouTube: ${exception}`); }
        }

        // if query is a Soundcloud URL
        else if (query.match(/^(http(s)?:\/\/)?((w){3}.)?soundcloud(\.com)?\/.+/)) {
            track = await get("http://api.soundcloud.com/resolve.json?url=" + query + "&client_id=" + this._soundcloudToken)
            .then(body => {
                response = JSON.parse(body);
                const localTrack = this.getSoundcloudInfo(response, voiceChannel); 
                return localTrack;
            })
            .catch((err: Error) => {
                return console.log(err);
            });
        }

        // else play argument was a YouTube search query
        else {
            try {
                // take all the words of the search query and join them, reassign 'query'
                query = params.join(" ");
                // get one video (top result) from the search query
                const videoResult: any[] = await this._youtubeAPI.searchVideos(query, 1); 

                // get video ID of top result of query
                response = await this._youtubeAPI.getVideoByID(videoResult[0].id);
                track = this.getYoutubeInfo(response, voiceChannel);
            } catch (exception) { console.log(exception); msgObject.channel.send(`Received error from YouTube: ${exception}`); }
        }

        queue.push(track);
        mediaData.queue = queue;
        
        try {
            let embed: Discord.MessageEmbed = this.createPlayResponse(track);
            if (mediaData.queue.length === 1) {
                msgObject.channel.send(embed);
                return this.playTrack(queue, client);
            } else {
                return msgObject.channel.send(embed);
            }
        } catch (exception) { msgObject.channel.send(`Error playing track from bot: ${exception}`); }
    }

    async getPlayFunction(track: any, connection: Discord.VoiceConnection)  {
        if (track.type === "youtube") {
            let highWaterMark: number;
            // use a lower highWaterMark if the video is >= 45 min
            track.durationMs >= 2700000 ? highWaterMark = this._highWaterMarkLong : highWaterMark = this._highWaterMarkShort;
            return connection.play(await this.ytdl(queue[0].url, { quality: "highestaudio", highWaterMark: highWaterMark }));
        } else {
            return connection.play(track.streamUrl)
        }
    }

    startIdleTimeout(client: Discord.Client, voiceChannel: Discord.VoiceChannel) {
        console.log("Starting sleep ... ");
        this._idleTimer = setTimeout(() => 
        {
            client.voice?.connections.forEach(connection => {
                if (connection.channel === voiceChannel) {
                    console.log("Going idle");
                    connection.disconnect();
                }
            });
        },
        900000)
    }

    endIdleTimeout() {
        clearTimeout(this._idleTimer);
    }

    playTrack(queue: Array<any>, client: Discord.Client) {
        let voiceChannel: Discord.VoiceChannel;
        
        queue[0].voiceChannel
            .join().then(async (connection: Discord.VoiceConnection) => {
                const dispatcher: Discord.StreamDispatcher = (await this.getPlayFunction(queue[0], connection))
                    .on("start", () => {
                        this.endIdleTimeout();
                        dispatcher.setVolume(ConfigFile.config.volume);
                        // save dispatcher so that it can be accessed by skip and other commands
                        mediaData.streamDispatcher = dispatcher;
                        voiceChannel = queue[0].voiceChannel;
                        client?.user?.setPresence({ activity: { name: queue[0].title } });
                    })
                    .on("finish", () => {
                        queue.shift();
                        client?.user?.setPresence({ activity: { name: "" } });
                        if (queue.length >= 1) {
                            console.log("Playing next track");
                            return this.playTrack(queue, client);
                        } else {
                            this.startIdleTimeout(client, voiceChannel);
                        }
                    })
                    .on("error", (e: Error) => {
                        // graceful recovery; skip the erroring track
                        this._textChannel?.send(`Error playing the track \`${queue[0].title}\` \nThis could be an error with the source track, but it might be worth trying again\nVerbose error: \`\`\`${e}\`\`\``);
                        mediaData?.streamDispatcher?.end();
                        return console.log(e);
                    });
            })
    }
}
