import * as Discord from "discord.js";
import * as ConfigFile from "../config";
import { mediaData } from "../index";
import { IBotCommand } from "../api";

export let queue = Array<any>();
export default class play implements IBotCommand {

    private readonly ytdl = require('ytdl-core');
    private readonly Youtube = require('simple-youtube-api');

    private readonly _command: string = "play";  
    private readonly youtube = new this.Youtube(ConfigFile.config.youtubeToken)
    
    private _isPlaying: boolean = false;

    help(): string[] {
        return ["play", "Play a YouTube link or play the 1st result of a YouTube search."];
    }

    isThisCommand(command: string): boolean {
        return command === this._command;
    }

    createPlayResponse(track: any): Discord.RichEmbed {
        const embed: Discord.RichEmbed = new Discord.RichEmbed();
        if (this._isPlaying == false) {
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

    async executeCommand(params: string[], msgObject: Discord.Message, client: Discord.Client) {
        /* Handle the message we received by checking what type of query it is */

        let voiceChannel: Discord.VoiceChannel = msgObject.member.voiceChannel;

        if (!voiceChannel) return msgObject.reply("You must join a voice channel before playing!");

        let query: string = msgObject.content.split(ConfigFile.config.prefix + "play ")[1];

        const track = {
            title: "",
            url: "",
            duration: "",
            thumbnail: "",
            voiceChannel: voiceChannel
        };

        let video: any;

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
                video = await this.youtube.getVideoByID(id);
            } catch (exception) { console.log(`Received error from YouTube: ${exception}`); }
        }

        // else play argument was a YouTube search term
        else {
            try { 
                // get one video (top result) from the search query
                const videoResult: any[] = await this.youtube.searchVideos(query, 1);

                // TODO?: Make 2nd parm not soft coded, add if (videoResult > 1) 

                // get video ID of top result of query
                video = await this.youtube.getVideoByID(videoResult[0].id);
            } catch (exception) { console.log(exception); msgObject.channel.send(`Received error from YouTube: ${exception}`); }
        }

        track.title = video.title;
        track.url = video.url;
        track.duration = this.formatVideoDuration(video.duration);
        track.thumbnail = video.thumbnails.high.url;

        queue.push(track);
        mediaData.queue = queue;
        try {
            if (this._isPlaying == false) {
                let embed: Discord.RichEmbed = this.createPlayResponse(track);
                this._isPlaying = true;
                msgObject.channel.send(embed);
                return this.playTrack(queue, client);
            } else {
                let embed: Discord.RichEmbed = this.createPlayResponse(track);
                return msgObject.channel.send(embed);
            }
        } catch (exception) { msgObject.channel.send(`Error playing track from bot: ${exception}`); }
    }

    playTrack(queue: Array<any>, client: Discord.Client) {
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
                        client.user.setPresence({ game: { name: queue[0].title } });
                    })
                    .on("end", () => {
                        queue.shift();
                        if (queue.length >= 1) {
                            return this.playTrack(queue, client);
                        } else {
                            this._isPlaying = false;
                            client.user.setPresence({ game: { name: "" } });
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