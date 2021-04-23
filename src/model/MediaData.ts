import { StreamDispatcher } from "discord.js"
import { Track } from "./Track"

export default class MediaData {
  public queue?: Array<Track>
  public streamDispatcher?: StreamDispatcher
  public lastPlayed?: Track 
}
