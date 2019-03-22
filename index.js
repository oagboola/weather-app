import express from "express"
import request from "request-promise-native"

import log from "./log"

const app = express()
const PORT = process.env.PORT || "3000"
const args = process.argv.slice(2)
const locations = JSON.parse(args[0])

const getLocationDetails = async (location, countryCode) => {
  try {
    const weatherResponse =
      await request.get(
        `https://api.openweathermap.org/data/2.5/weather?` +
        `APPID=${process.env.OPENWEATHER_API_KEY}` +
        `&q=${location},${countryCode}`
      )
    const weatherDetails = JSON.parse(weatherResponse)
    const { lat, lon } = weatherDetails.coord
    const targetDate = new Date()
    const timeStamp = targetDate.getTime() / 1000 + targetDate.getTimezoneOffset() * 60
    const timeZoneResponse =
      await request.get(
        `https://maps.googleapis.com/maps/api/timezone/json?location=` +
        `${lat},${lon}` +
        `&timestamp=${timeStamp}` +
        `&key=${process.env.GOOGLE_MAPS_API}`
      )
    const timeDetails = JSON.parse(timeZoneResponse)
    if (timeDetails.errorMessage) {
      timeDetails.api = "Google"
      throw new Error(JSON.stringify(timeDetails))
    }
    const { dstOffset, rawOffset } = timeDetails
    const offsetsSum = dstOffset * 1000 + rawOffset * 1000
    let localTime = new Date(timeStamp * 1000 + offsetsSum)
    const localOffset = (targetDate.getTimezoneOffset() / 60) * -1
    localTime = new Date( localTime.setHours(localTime.getHours() + localOffset))
    return { weatherDetails, localTime }
  } catch (err) {
    return { error: err }
  }
}

const processLocationDetails = locations => {
  return Promise.all(
    locations.map(location => {
      return getLocationDetails(location.location, location.countryCode)
    })).then(results => {
      log.info(JSON.stringify(results))
      return JSON.stringify(results)
    }).catch(error => {
      log.error(error)
      return error
    }
  )
}

app.listen(PORT, () => {
  log.info("App running on port", PORT)
  processLocationDetails(locations)
})
