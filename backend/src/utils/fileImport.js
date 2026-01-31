// File Import Service for parsing KML/TCX/GPX files
import * as fs from 'fs/promises'
import { DOMParser } from '@xmldom/xmldom'

export class FileImportService {
  constructor() {
    this.parser = new DOMParser()
  }

  async importFile(filePath, fileType) {
    try {
      const content = await fs.readFile(filePath, 'utf-8')

      if (fileType === 'kml') {
        return this.parseKML(content)
      } else if (fileType === 'gpx') {
        return this.parseGPX(content)
      } else if (fileType === 'tcx') {
        return this.parseTCX(content)
      } else {
        throw new Error('Unsupported file type')
      }
    } catch (error) {
      throw new Error(`Failed to import file: ${error.message}`)
    }
  }

  async importFileContent(content, fileType) {
    try {
      if (fileType === 'kml') {
        return this.parseKML(content)
      } else if (fileType === 'gpx') {
        return this.parseGPX(content)
      } else if (fileType === 'tcx') {
        return this.parseTCX(content)
      } else {
        throw new Error('Unsupported file type')
      }
    } catch (error) {
      throw new Error(`Failed to import file: ${error.message}`)
    }
  }

  parseKML(content) {
    const doc = this.parser.parseFromString(content, 'text/xml')

    // Extract basic info from KML
    const folder = doc.getElementsByTagName('Folder')[0]
    const name = folder.getElementsByTagName('name')[0]?.textContent || 'Unknown'

    // Extract extended data
    const extendedData = folder.getElementsByTagName('ExtendedData')[0]
    const totalTime = this.getDataValue(extendedData, 'totalTime') // in seconds
    const totalDistance = this.getDataValue(extendedData, 'totalDistance') // in meters
    const cumulativeClimb = this.getDataValue(extendedData, 'cumulativeClimb') // in meters
    const cumulativeDecrease = this.getDataValue(extendedData, 'cumulativeDecrease') // in meters

    // Extract track points for map visualization
    const trackPoints = []
    const placemarks = doc.getElementsByTagName('Placemark')

    for (const placemark of placemarks) {
      const point = placemark.getElementsByTagName('Point')[0]
      if (!point) continue

      const coords = point.getElementsByTagName('coordinates')[0]?.textContent
      if (!coords) continue

      const [lon, lat, alt] = coords.split(',').map(c => parseFloat(c.trim()))
      const timeSpan = placemark.getElementsByTagName('TimeSpan')[0]
      const begin = timeSpan?.getElementsByTagName('begin')[0]?.textContent

      if (begin && !isNaN(lat) && !isNaN(lon)) {
        trackPoints.push({
          lat,
          lon,
          alt: alt || 0,
          time: new Date(begin).getTime()
        })
      }
    }

    // Calculate elevation stats
    let maxElevation = -Infinity
    let minElevation = Infinity
    trackPoints.forEach(p => {
      if (p.alt > maxElevation) maxElevation = p.alt
      if (p.alt < minElevation) minElevation = p.alt
    })

    // Calculate calories burned
    const distanceKm = totalDistance / 1000
    const caloriesBurned = Math.round(distanceKm * 45) // ~45 kcal per km for walking

    // Calculate pace and speed
    const durationMinutes = Math.round(totalTime / 60)
    const avgPace = distanceKm > 0 ? durationMinutes / distanceKm : null
    const avgSpeed = durationMinutes > 0 ? (distanceKm / durationMinutes) * 60 : null

    // Calculate max speed (between consecutive points)
    let maxSpeed = 0
    for (let i = 1; i < trackPoints.length; i++) {
      const prev = trackPoints[i - 1]
      const curr = trackPoints[i]
      const timeDiff = (curr.time - prev.time) / 1000 // seconds
      if (timeDiff > 0) {
        const dist = this.calculateDistance(prev.lat, prev.lon, curr.lat, curr.lon)
        const speed = (dist / timeDiff) * 3.6 // m/s to km/h
        if (speed > maxSpeed) maxSpeed = speed
      }
    }

    return {
      name,
      type: this.detectExerciseType(name, trackPoints),
      date: this.detectDate(trackPoints),
      durationMinutes,
      distanceKm: Math.round(distanceKm * 100) / 100,
      caloriesBurned,
      avgPace: avgPace ? Math.round(avgPace * 100) / 100 : null,
      maxSpeed: maxSpeed > 0 ? Math.round(maxSpeed * 100) / 100 : null,
      maxElevation: maxElevation > -Infinity ? Math.round(maxElevation) : null,
      minElevation: minElevation < Infinity ? Math.round(minElevation) : null,
      totalClimb: Math.round(cumulativeClimb),
      totalDescent: Math.round(cumulativeDecrease),
      trackPoints,
      notes: `KML导入 - 爬升${cumulativeClimb}米，下降${cumulativeDecrease}米`
    }
  }

  parseGPX(content) {
    const doc = this.parser.parseFromString(content, 'text/xml')
    const track = doc.getElementsByTagName('trk')[0]

    if (!track) {
      throw new Error('No track found in GPX file')
    }

    const name = track.getElementsByTagName('name')[0]?.textContent || 'Unknown Activity'

    // Extract track points
    const trackPoints = []
    const trackSegments = track.getElementsByTagName('trkpt')

    for (const seg of trackSegments) {
      const lat = parseFloat(seg.getAttribute('lat'))
      const lon = parseFloat(seg.getAttribute('lon'))
      const ele = parseFloat(seg.getElementsByTagName('ele')[0]?.textContent) || 0
      const time = seg.getElementsByTagName('time')[0]?.textContent

      if (!isNaN(lat) && !isNaN(lon)) {
        trackPoints.push({
          lat,
          lon,
          alt: ele,
          time: time ? new Date(time).getTime() : null
        })
      }
    }

    // Calculate statistics
    let totalDistance = 0
    let totalClimb = 0
    let cumulativeDescent = 0
    let maxElevation = -Infinity
    let minElevation = Infinity
    let maxSpeed = 0

    for (let i = 1; i < trackPoints.length; i++) {
      const prev = trackPoints[i - 1]
      const curr = trackPoints[i]

      // Distance
      const dist = this.calculateDistance(prev.lat, prev.lon, curr.lat, curr.lon)
      totalDistance += dist

      // Elevation gain/loss
      const altDiff = curr.alt - prev.alt
      if (altDiff > 0) {
        totalClimb += altDiff
      } else {
        cumulativeDescent += Math.abs(altDiff)
      }

      // Track elevation
      if (curr.alt > maxElevation) maxElevation = curr.alt
      if (curr.alt < minElevation) minElevation = curr.alt

      // Calculate speed between points
      if (curr.time && prev.time) {
        const timeDiff = (curr.time - prev.time) / 1000 // seconds
        if (timeDiff > 0) {
          const speed = (dist / timeDiff) * 3.6 // m/s to km/h
          if (speed > maxSpeed) maxSpeed = speed
        }
      }
    }

    const distanceKm = totalDistance / 1000
    const caloriesBurned = Math.round(distanceKm * 50) // ~50 kcal per km
    const startTime = trackPoints[0]?.time
    const endTime = trackPoints[trackPoints.length - 1]?.time
    const durationMinutes = startTime && endTime ? Math.round((endTime - startTime) / 60000) : 0

    // Calculate pace and speed
    const avgPace = distanceKm > 0 ? durationMinutes / distanceKm : null
    const avgSpeed = durationMinutes > 0 ? (distanceKm / durationMinutes) * 60 : null

    return {
      name,
      type: this.detectExerciseType(name, trackPoints),
      date: startTime ? new Date(startTime) : new Date(),
      durationMinutes,
      distanceKm: Math.round(distanceKm * 100) / 100,
      caloriesBurned,
      avgPace: avgPace ? Math.round(avgPace * 100) / 100 : null,
      maxSpeed: maxSpeed > 0 ? Math.round(maxSpeed * 100) / 100 : null,
      maxElevation: maxElevation > -Infinity ? Math.round(maxElevation) : null,
      minElevation: minElevation < Infinity ? Math.round(minElevation) : null,
      totalClimb: Math.round(totalClimb),
      totalDescent: Math.round(cumulativeDescent),
      trackPoints,
      notes: 'GPX导入'
    }
  }

  parseTCX(content) {
    const doc = this.parser.parseFromString(content, 'text/xml')
    const activities = doc.getElementsByTagName('Activity')

    if (!activities.length) {
      throw new Error('No activity found in TCX file')
    }

    const activity = activities[0]
    const sport = activity.getElementsByTagName('Sport')[0]?.textContent || 'Unknown'

    // Extract laps
    const laps = activity.getElementsByTagName('Lap')
    if (!laps.length) {
      throw new Error('No laps found in TCX file')
    }

    // Get the first lap's data
    const lap = laps[0]
    const totalTimeSeconds = parseFloat(lap.getAttribute('TotalTimeSeconds')) || 0
    const distanceMeters = parseFloat(lap.getAttribute('DistanceMeters')) || 0

    // Extract track points
    const trackPoints = []
    const track = activity.getElementsByTagName('Track')[0]
    const trackSegments = track ? track.getElementsByTagName('Trackpoint') : []

    for (const seg of trackSegments) {
      const lat = parseFloat(seg.getElementsByTagName('Position')[0]?.getElementsByTagName('LatitudeDegrees')[0]?.textContent)
      const lon = parseFloat(seg.getElementsByTagName('Position')[0]?.getElementsByTagName('LongitudeDegrees')[0]?.textContent)
      const alt = parseFloat(seg.getElementsByTagName('AltitudeMeters')[0]?.textContent) || 0
      const time = seg.getElementsByTagName('Time')[0]?.textContent

      if (!isNaN(lat) && !isNaN(lon) && time) {
        trackPoints.push({
          lat,
          lon,
          alt,
          time: new Date(time).getTime()
        })
      }
    }

    // Calculate statistics
    let totalClimb = 0
    let cumulativeDescent = 0
    let maxElevation = -Infinity
    let minElevation = Infinity
    let maxSpeed = 0

    for (let i = 1; i < trackPoints.length; i++) {
      const prev = trackPoints[i - 1]
      const curr = trackPoints[i]

      const altDiff = curr.alt - prev.alt
      if (altDiff > 0) {
        totalClimb += altDiff
      } else {
        cumulativeDescent += Math.abs(altDiff)
      }

      // Track elevation
      if (curr.alt > maxElevation) maxElevation = curr.alt
      if (curr.alt < minElevation) minElevation = curr.alt

      // Calculate speed between points
      const timeDiff = (curr.time - prev.time) / 1000 // seconds
      if (timeDiff > 0) {
        const dist = this.calculateDistance(prev.lat, prev.lon, curr.lat, curr.lon)
        const speed = (dist / timeDiff) * 3.6 // m/s to km/h
        if (speed > maxSpeed) maxSpeed = speed
      }
    }

    const distanceKm = distanceMeters / 1000
    const durationMinutes = Math.round(totalTimeSeconds / 60)
    const caloriesBurned = Math.round(distanceKm * 50)
    const startTime = trackPoints[0]?.time

    // Calculate pace and speed
    const avgPace = distanceKm > 0 ? durationMinutes / distanceKm : null
    const avgSpeed = durationMinutes > 0 ? (distanceKm / durationMinutes) * 60 : null

    return {
      name: sport.charAt(0).toUpperCase() + sport.slice(1),
      type: this.mapSportToType(sport),
      date: startTime ? new Date(startTime) : new Date(),
      durationMinutes,
      distanceKm: Math.round(distanceKm * 100) / 100,
      caloriesBurned,
      avgPace: avgPace ? Math.round(avgPace * 100) / 100 : null,
      maxSpeed: maxSpeed > 0 ? Math.round(maxSpeed * 100) / 100 : null,
      maxElevation: maxElevation > -Infinity ? Math.round(maxElevation) : null,
      minElevation: minElevation < Infinity ? Math.round(minElevation) : null,
      totalClimb: Math.round(totalClimb),
      totalDescent: Math.round(cumulativeDescent),
      trackPoints,
      notes: `TCX导入 - 爬升${Math.round(totalClimb)}米，下降${Math.round(cumulativeDescent)}米`
    }
  }

  getDataValue(extendedData, name) {
    const data = extendedData.getElementsByTagName('Data')[0]
    if (!data) return 0
    const value = data.getElementsByTagName('value')[0]?.textContent
    return parseFloat(value) || 0
  }

  detectExerciseType(name, trackPoints) {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('跑步') || lowerName.includes('run') || lowerName.includes('jog')) {
      return 'running'
    } else if (lowerName.includes('骑行') || lowerName.includes('cycle') || lowerName.includes('bike')) {
      return 'cycling'
    } else if (lowerName.includes('游泳') || lowerName.includes('swim')) {
      return 'swimming'
    } else if (lowerName.includes('步行') || lowerName.includes('walk') || lowerName.includes('hike')) {
      // Detect hiking by elevation gain
      const avgSpeed = this.calculateAverageSpeed(trackPoints)
      if (avgSpeed < 4 && this.getTotalClimb(trackPoints) > 100) {
        return 'hiking'
      }
      return 'walking'
    }
    return 'other'
  }

  mapSportToType(sport) {
    const lowerSport = sport.toLowerCase()
    if (lowerSport.includes('run') || lowerSport.includes('跑步')) return 'running'
    if (lowerSport.includes('bike') || lowerSport.includes('cycle') || lowerSport.includes('骑行')) return 'cycling'
    if (lowerSport.includes('swim') || lowerSport.includes('游泳')) return 'swimming'
    if (lowerSport.includes('walk') || lowerSport.includes('步行')) return 'walking'
    if (lowerSport.includes('hike') || lowerSport.includes('登山')) return 'hiking'
    return 'other'
  }

  detectDate(trackPoints) {
    if (trackPoints.length === 0) return new Date()
    return new Date(trackPoints[0].time)
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000 // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  calculateAverageSpeed(trackPoints) {
    if (trackPoints.length < 2) return 0

    const startTime = trackPoints[0].time
    const endTime = trackPoints[trackPoints.length - 1].time
    const durationSeconds = (endTime - startTime) / 1000

    if (durationSeconds === 0) return 0

    // Calculate total distance
    let totalDistance = 0
    for (let i = 1; i < trackPoints.length; i++) {
      const prev = trackPoints[i - 1]
      const curr = trackPoints[i]
      totalDistance += this.calculateDistance(prev.lat, prev.lon, curr.lat, curr.lon)
    }

    return (totalDistance / 1000) / (durationSeconds / 3600) // km/h
  }

  getTotalClimb(trackPoints) {
    let totalClimb = 0
    for (let i = 1; i < trackPoints.length; i++) {
      const prev = trackPoints[i - 1]
      const curr = trackPoints[i]
      const altDiff = curr.alt - prev.alt
      if (altDiff > 0) {
        totalClimb += altDiff
      }
    }
    return totalClimb
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180)
  }
}

export default FileImportService
