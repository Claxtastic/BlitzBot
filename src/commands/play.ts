import * as Discord from "discord.js"
import * as ConfigFile from "../config"
import fetch, {Response} from "node-fetch"
import {log, mediaData} from "../index"
import {IBotCommand} from "../api"
import {Track} from "../model/Track"
import {SoundcloudTrack} from "../model/SoundcloudTrack"
import {YoutubeTrack} from "../model/YoutubeTrack"
import {constants} from "../constants"
import seek from "./seek"
import Youtube from "simple-youtube-api"
import ytdl from "ytdl-core"

export const queue = Array<Track>()
export default class play implements IBotCommand {

  private readonly youtubeAPI = new Youtube(ConfigFile.config.youtubeToken)

  private readonly soundcloudToken: string = constants.SOUNDCLOUD_TOKEN
  private readonly highWaterMarkLong: number = constants.HIGH_WATER_MARK_LONG
  private readonly highWaterMarkShort: number = constants.HIGH_WATER_MARK_SHORT

  private readonly commands: string[] = ["play", "p"]

  private idleTimer: NodeJS.Timeout
  private textChannel: Discord.TextChannel | undefined

  help(): string[] {
    return ["play", "Play a YouTube link, the 1st result of a YouTube search, YouTube playlist, or a Soundcloud link."]
  }

  isThisCommand(command: string): boolean {
    return this.commands.includes(command)
  }

  formatVideoDuration(durationObject: { hours: number; minutes: string | number; seconds: string | number }): string {
    let hoursBit = ""
    // if video is hours long, include if video hours < 10, add leading zero
    // else, video is not hours long, empty string
    if (durationObject.hours) {
      hoursBit = `${durationObject.hours}:`
      if (durationObject.hours < 10) {
        hoursBit = "0" + hoursBit
      }
    }
    return `${hoursBit}${
      durationObject.minutes < 10
        ? "0" + durationObject.minutes : durationObject.minutes
        ? durationObject.minutes : "00"
    }:${
      durationObject.seconds < 10
        ? "0" + durationObject.seconds : durationObject.seconds
        ? durationObject.seconds : "00"
    }`
  }

  formatSoundcloudDuration(ms: number): string {
    const hours: number = Math.floor(((ms / (1000*60*60)) % 24))
    const minutes: number = Math.floor(((ms / (1000*60)) % 60))
    const seconds: number = Math.floor((ms / 1000) % 60)
    let hoursBit = ""
    if (hours > 0) {
      hoursBit = `${hours}:`
      if (hours < 10) {
        hoursBit = "0" + hoursBit
      }
    }
    return `${hoursBit}${
      minutes < 10
        ? "0" + minutes : minutes
        ? minutes : "00"
    }:${
      seconds < 10
        ? "0" + seconds : seconds
        ? seconds : "00"
    }`
  }

  createPlayResponse(track: Track): Discord.MessageEmbed {
    const embed: Discord.MessageEmbed = new Discord.MessageEmbed()
    if (mediaData.queue?.length === 1 || mediaData.queue?.length === 0) {
      embed.setTitle("Playing track")
    } else {
      embed.setTitle("Track added to queue")
    }

    embed
      .setColor(constants.RED)
      .setThumbnail(track.thumbnail)
      .setDescription(`${track.title} added to queue \n ${track.url}`)
      .addField("Track Duration: ", `${track.duration}`)
    return embed
  }

  createPlaylistResponse(playlist, length: number) {
    const embed: Discord.MessageEmbed = new Discord.MessageEmbed()
    embed
      .setTitle(`Starting playlist ${playlist.title}`)
      .setColor(constants.RED)
      .setThumbnail(playlist.thumbnails.high.url)
      .setDescription(`Added ${length} tracks to queue \n ${playlist.url}`)
    return embed
  }

  createErrorResponse(track: Track, e: Error): Discord.MessageEmbed {
    const embed: Discord.MessageEmbed = new Discord.MessageEmbed()
    embed
      .setTitle(`${track.title} was unable to be played.`)
      .setColor(constants.RED)
      .setDescription(`This could be unavoidable due to copyright or other restrictions, but it doesn't hurt to try again.`)
      .addField("Verbose error: ", `\`\`\`${e}\`\`\``)
      .setFooter(`The time of man has come to an end.`)
    return embed
  }

  isYouTube(query: String): RegExpMatchArray { return query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/) }

  isYoutubePlaylist(query: String): RegExpMatchArray { return query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/playlist.+/) }

  isSoundcloud(query: String): RegExpMatchArray { return query.match(/^(http(s)?:\/\/)?((w){3}.)?soundcloud(\.com)?\/.+/) }

  hasTimestamp(params: String[]): RegExpMatchArray {
    if (params[1]) return params[1].match(/\d{2}:\d{2}:\d{2}/)
    else return null
  }

  async executeCommand(params: string[], message: Discord.Message, client: Discord.Client) {
    if (!message.member?.voice || !message.member.voice.channel) {
      return message.reply("You must join a voice channel before playing!")
    }
    const voiceChannel: Discord.VoiceChannel = message.member.voice.channel
    // save the text channel in case we have to send any errors
    this.textChannel = message.channel as Discord.TextChannel

    let query: string = params[0]
    if (!query) return message.reply("Please provide either: 1. A YouTube URL with optional timestamp 2. A YouTube playlist 3. A Soundcloud URL 4. YouTube search terms")

    // the resulting track created by the query
    let track: Track
    let seekTime: number = 0

    /** Handle the message we received by checking what type of query it is **/
    if (this.isYouTube(query)) {
      if (this.isYoutubePlaylist(query)) {
        await this.handleYoutubePlaylist(query, message, client)
      }
      // else query is Single Youtube URL
      else {
        const queryParts: string[] = query
          .replace(/([><])/gi, '')
          .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)

        // the youtube video /watch? ID
        const id: string = queryParts[2].split(/[^0-9a-z_-]/i)[0]

        track = await this.handleYoutubeUrl(id, voiceChannel)
        if (this.hasTimestamp(params)) track.seekTime = seek.getSecFromTimestamp(params[1])
      }
    }
    else if (this.isSoundcloud(query)) {
      track = await this.handleSoundcloudTrack(query, voiceChannel)
      if (this.hasTimestamp(params)) track.seekTime = seek.getSecFromTimestamp(params[1])
    }
    // else play argument was a YouTube search query
    else {
      query = params.join(" ")
      track = await this.handleYoutubeQuery(query, voiceChannel)
    }

    // do a final check before we enqueue and attempt playing of track
    if (track !== undefined) {
      await this.enqueue(track, message, client)
    }
    else {
      log.error(`Track is undefined; not enqueuing`)
      return message.channel.send(`Error when handling the query; this query was not parsed into a playable track`)
    }
  }

  /** Handle a single Youtube url **/
  async handleYoutubeUrl(id: string, voiceChannel: Discord.VoiceChannel): Promise<YoutubeTrack> {
    log.debug("Query is single Youtube video")

    // GET video with query ID
    return await this.youtubeAPI.getVideoByID(id)
      .then(video => this.createYoutubeTrack(video, voiceChannel))
      .catch((e: Error) => log.error(`Error getting video by ID: ${id}`))
  }

  /** Handle Youtube query **/
  async handleYoutubeQuery(query: string, voiceChannel: Discord.VoiceChannel): Promise<Track> {
    log.debug("Query is a Youtube query")

    // GET videos with query
    return await this.youtubeAPI.searchVideos(query, 1)
      .then(async videoResults => {
        // GET video object for top result
        return await this.youtubeAPI.getVideoByID(videoResults[0].id)
          .then(video => this.createYoutubeTrack(video, voiceChannel))
          .catch((e: Error) => log.error(e))
      })
      .catch((e: Error) => log.error(e))
  }

  /** Handle a Youtube playlist query **/
  async handleYoutubePlaylist(query: string, message: Discord.Message, client: Discord.Client) {
    log.debug("Query is a Youtube playlist query")

    // GET playlist with URL
    await this.youtubeAPI.getPlaylist(query)
      .then(async playlist => {
        // GET videos array from playlist
        await playlist.getVideos()
          .then(async videos  => {
            log.info(`Starting playlist ${playlist.title}`)
            const embed: Discord.MessageEmbed = this.createPlaylistResponse(playlist, videos.length)
            await message.channel.send(embed)
            for (const video of videos) {
              // GET video by ID so we get an object w/duration
              const fullVideo = await this.youtubeAPI.getVideoByID(video.id)
              const youtubeTrack: YoutubeTrack = this.createYoutubeTrack(fullVideo, message.member.voice.channel)
              // enqueue each track
              await this.enqueue(youtubeTrack, message, client, true);
            }
          })
          .catch((e: Error) => log.error(`Error getting videos from playlist: ${playlist.title}\n${e}`))
      })
      .catch((e: Error) => log.error(e))
    return
  }

  /** Handle a Soundcloud track query **/
  async handleSoundcloudTrack(query: string, voiceChannel: Discord.VoiceChannel): Promise<Track> {
    log.info("Query is a Soundcloud query")

    // GET track from Soundcloud
    return await fetch("http://api.soundcloud.com/resolve.json?url=" + query + "&client_id=" + this.soundcloudToken)
      .then((res: Response) => res.json())
      .then((json: JSON): SoundcloudTrack => { return this.createSoundcloudTrack(json, voiceChannel) })
      .catch((err: Error) => {
        log.error(err)
        return Promise.reject(err)
      })
  }

  createYoutubeTrack(video, voiceChannel: Discord.VoiceChannel): YoutubeTrack {
    return {
      url: video.url,
      title: video.title,
      duration: this.formatVideoDuration(video.duration),
      durationMs: video.duration,
      thumbnail: video.thumbnails.high.url,
      voiceChannel: voiceChannel,
      type: "youtube"
    } as YoutubeTrack
  }

  createSoundcloudTrack(response, voiceChannel: Discord.VoiceChannel) {
    return {
      url: response.permalink_url,
      title: response.title,
      duration: this.formatSoundcloudDuration(response.duration),
      durationMs: response.duration,
      thumbnail: response.user.avatar_url,
      voiceChannel: voiceChannel,
      streamUrl: "http://api.soundcloud.com/tracks/" + response.id + "/stream?consumer_key=71dfa98f05fa01cb3ded3265b9672aaf",
      type: "soundcloud"
    } as SoundcloudTrack
  }

  async enqueue(track: Track, message: Discord.Message, client: Discord.Client, isPlaylistChild=false) {
    queue.push(track)
    mediaData.queue = queue

    // if this track is the child of a playlist, don't send an embed for every video
    if (!isPlaylistChild) {
      const embed: Discord.MessageEmbed = this.createPlayResponse(track)
      await message.channel.send(embed)
    }

    // play immediately if we just queued the first track
    if (mediaData.queue.length === 1)
      return this.playTrack(queue, client)
  }

  async getPlayFunction(track: Track, connection: Discord.VoiceConnection)  {
    let streamOptions = { fec: true, seek: track.seekTime }

    if (track.type === "youtube") {
      let highWaterMark: number
      // use a lower highWaterMark if the video is >= 45 min
      track.durationMs >= 2700000 ? highWaterMark = this.highWaterMarkLong : highWaterMark = this.highWaterMarkShort
      log.debug(`Getting play function for Youtube track with highWaterMark: ${highWaterMark}`)
      let ytdlRes = await ytdl(queue[0].url, { filter: 'audioonly', quality: "highestaudio", highWaterMark: highWaterMark })
      log.debug(`Response from ytdl: ${ytdlRes}`)
      return connection.play(ytdlRes, streamOptions)
    } else if (track.type === "soundcloud") {
      log.debug(`Getting play function for Soundcloud track`)
      return connection.play((track as SoundcloudTrack).streamUrl, streamOptions)
    }
  }

  startIdleTimeout(client: Discord.Client, voiceChannel: Discord.VoiceChannel) {
    log.info("Starting sleep ... ")
    this.idleTimer = setTimeout(() =>
      {
        client.voice?.connections.forEach(connection => {
          if (connection.channel === voiceChannel) {
            log.info("Going idle")
            connection.disconnect()
          }
        })
      }, 900000)
  }

  endIdleTimeout() {
    clearTimeout(this.idleTimer)
  }

  playTrack(queue: Array<Track>, client: Discord.Client, seek = 0) {
    let voiceChannel: Discord.VoiceChannel

    queue[0].voiceChannel
      .join().then(async (connection: Discord.VoiceConnection) => {
      const dispatcher: Discord.StreamDispatcher = (await this.getPlayFunction(queue[0], connection))
        .on("start", () => {
          log.info(`Starting track ${queue[0].title}`)
          this.endIdleTimeout()
          dispatcher.setVolume(ConfigFile.config.volume)
          // save dispatcher so that it can be accessed by skip and other commands
          mediaData.streamDispatcher = dispatcher
          voiceChannel = queue[0].voiceChannel
          client?.user?.setPresence({ activity: { name: queue[0].title } })
        })
        .on("finish", () => {
          log.debug(`Track finished`)
          this.playNextTrackOrStartTimeout(queue, client, voiceChannel)
        })
        .on("error", (e: Error) => {
          // send an embed with the error
          const embed: Discord.MessageEmbed = this.createErrorResponse(queue[0], e)
          this.textChannel.send(embed)
          log.error(`Error playing track: ${e}`)
          // graceful recovery, start next track or timeout
          this.playNextTrackOrStartTimeout(queue, client, voiceChannel)
        })
    })
  }

  playNextTrackOrStartTimeout(queue: Array<Track>, client: Discord.Client, voiceChannel: Discord.VoiceChannel) {
    mediaData?.streamDispatcher?.end()
    queue.shift()
    client?.user?.setPresence({ activity: { name: "" } })
    log.debug(`Queue length: ${queue.length}`)
    if (queue.length >= 1) {
      this.playTrack(queue, client)
    } else {
      this.startIdleTimeout(client, voiceChannel)
    }
  }
}
