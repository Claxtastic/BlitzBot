import * as Discord from "discord.js";
import * as ConfigFile from "../config";
import { mediaData } from "../index";
import { IBotCommand } from "../api";

// export let queue = Array<any>();
export default class play implements IBotCommand {

    private readonly ytdl = require('ytdl-core');
    private readonly Youtube = require('simple-youtube-api');

    private readonly _command: string = "play";  
    private readonly youtube = new this.Youtube(ConfigFile.config.youtubeToken)

    private _isPlaying: boolean = false;
    private _queue = Array<any>();

    help(): string {
        return "Play somethin.";
    }

    isThisCommand(command: string): boolean {
        return command === this._command;
    }

    // createPlayResponse() {}
    // TODO: Wrap play message response from bot in here

    formatVideoDuration(durationObject: any): string {
        let hoursBit: string = "";
        // if video is hours long, include; if video hours < 10, add leading zero
        // else, video is not hours long, empty string
        if (durationObject.hours) {
            hoursBit = `${durationObject.hours} + ":"`;
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

    async executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client) {
        /* Handle the message we received by checking what type of query it is */

        let voiceChannel: Discord.VoiceChannel = msgObject.member.voiceChannel;

        if (!voiceChannel) return msgObject.reply("You must join a voice channel before playing!");

        let query: string = msgObject.content.split(ConfigFile.config.prefix + "play ")[1];

        // if query is a YouTube URL
        if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
            const url: string = query;

            try {
                // get video youtube /watch?
                let queryParts: string[] = query
                    .replace(/(>|<)/gi, '')
                    .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);

                // the youtube video /watch? ID
                const id: string = queryParts[2].split(/[^0-9a-z_\-]/i)[0];
                // youtube video object
                const video = await this.youtube.getVideoByID(id);

                // extract properties from youtube video object
                const title: string = video.title;
                const duration: string = this.formatVideoDuration(video.duration);
                const thumbnail = video.thumbnails.high.url;
                const track = {
                    url,
                    title,
                    duration,
                    thumbnail,
                    voiceChannel
                };

                this._queue.push(track);

                if (this._isPlaying == false) {
                    this._isPlaying = true;
                    let embed: Discord.RichEmbed = new Discord.RichEmbed()
                        .setTitle("Playing track")
                        .setColor("#c4302b")
                        .setThumbnail(this._queue[0].thumbnail)
                        .setDescription(`${track.title} \n ${track.url}`)
                        .addField("Track Duration: ", `${track.duration}`); 
                    msgObject.channel.send(embed);
                    return this.playTrack(this._queue)
                } else if (this._isPlaying == true) {
                    let embed: Discord.RichEmbed = new Discord.RichEmbed()
                        .setTitle("Track added to queue")
                        .setColor("#c4302b")
                        .setThumbnail(this._queue[0].thumbnail)
                        .setDescription(`${track.title} added to queue \n ${track.url}`)
                        .addField("Track Duration: ", `${track.duration}`); 
                    return msgObject.channel.send(embed);
                }
                
            } catch (exception) {
                console.log(exception);
            }
        }
        
        /* query is a youtube search term */
        try { 
            // get one video (top result) from the search query
            const videoResult: any[] = await this.youtube.searchVideos(query, 1);

            // TODO?: Make 2nd parm not soft coded, add if (videoResult > 1) 

            // get video ID of top result of query
            const video = await this.youtube.getVideoByID(videoResult[0].id);

            const url: string = video.url; 
            const title: string = video.title;
            const duration: string = this.formatVideoDuration(video.duration);
            const thumbnail = video.thumbnails.high.url;
            const track = {
                url,
                title,
                duration,
                thumbnail,
                voiceChannel
            };

            this._queue.push(track);
            try {
                if (this._isPlaying == false) {
                    this._isPlaying = true;
                    let embed: Discord.RichEmbed = new Discord.RichEmbed()
                        .setTitle("Playing track")
                        .setColor("#c4302b")
                        .setThumbnail(this._queue[0].thumbnail)
                        .setDescription(`${track.title} \n ${track.url}`)
                        .addField("Track Duration: ", `${track.duration}`); 
                    msgObject.channel.send(embed);
                    return this.playTrack(this._queue);
                } else if (this._isPlaying == true) {
                    let embed: Discord.RichEmbed = new Discord.RichEmbed()
                        .setTitle("Track added to queue")
                        .setColor("#c4302b")
                        .setThumbnail(track.thumbnail)
                        .setDescription(`${track.title} added to queue \n ${track.url}`)
                        .addField("Track Duration: ", `${track.duration}`); 
                    return msgObject.channel.send(embed);
                }
            } catch (exception) { msgObject.channel.send(`Error playing track from bot: ${exception}`); }

        } catch (exception) { console.log(exception); msgObject.channel.send(`Received error from YouTube: ${exception}`); }
    }

    playTrack(queue: Array<any>) {
        let voiceChannel: Discord.VoiceChannel;
        
        // begin at queue[0]
        queue[0].voiceChannel
            .join().then((connection: Discord.VoiceConnection) => {
                const dispatcher: Discord.StreamDispatcher = connection
                    .playStream(
                        this.ytdl(queue[0].url, {
                            volume: 0.1,
                            quality: 'highestaudio',
                            highWaterMark: 1024 * 1024 * 10
                        })
                    )
                    .on("start", () => {
                        // save dispatcher so that it can be accessed by skip and other commands
                        mediaData.streamDispatcher = dispatcher;
                        voiceChannel = queue[0].voiceChannel;
                    })
                    .on("end", () => {
                        queue.shift();
                        if (queue.length >= 1) {
                            return this.playTrack(queue);
                        } else {
                            this._isPlaying = false;
                        }
                    })
                    .on('error', (e: any) => {
                        return console.log(e);
                    });
            })
            .catch((err: any) => {
                return console.log(err);
            });
    }
}