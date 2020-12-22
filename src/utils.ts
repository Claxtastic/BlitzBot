export default class utils {

  static getSecFromTimestamp(timestamp: String): number {
    let splitTimestamp = timestamp.split(":")
    let hoursSec = parseInt(splitTimestamp[0]) * 60 * 60
    let minutesSec = parseInt(splitTimestamp[1]) * 60
    return hoursSec + minutesSec + parseInt(splitTimestamp[2])
  }

  static getSecFromDurationObject(durationObject: { hours: number; minutes: number; seconds: number }): number {
    let hoursSec = durationObject.hours * 60 * 60
    let minutesSec = durationObject.minutes * 60
    return hoursSec + minutesSec + durationObject.seconds
  }

  static formatSoundcloudDuration(ms: number): string {
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

  static formatVideoDuration(durationObject: { hours: number; minutes: number; seconds: number }): string {
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
}
