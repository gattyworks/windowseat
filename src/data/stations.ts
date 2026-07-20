import type { Place, RoutePreset } from '../types'

export const STATIONS: Place[] = [
  { id: 'sbc', code: 'SBC', name: 'Bengaluru', detail: 'KSR Bengaluru City Junction', lat: 12.9788, lng: 77.5696, source: 'station' },
  { id: 'mys', code: 'MYS', name: 'Mysuru', detail: 'Mysuru Junction', lat: 12.3167, lng: 76.6453, source: 'station' },
  { id: 'ubl', code: 'UBL', name: 'Hubballi', detail: 'Shri Siddharoodha Swamiji Hubballi', lat: 15.3502, lng: 75.1376, source: 'station' },
  { id: 'mao', code: 'MAO', name: 'Madgaon', detail: 'Madgaon Junction, Goa', lat: 15.2671, lng: 73.9704, source: 'station' },
  { id: 'mas', code: 'MAS', name: 'Chennai', detail: 'MGR Chennai Central', lat: 13.0822, lng: 80.2755, source: 'station' },
  { id: 'maq', code: 'MAQ', name: 'Mangaluru', detail: 'Mangaluru Central', lat: 12.8663, lng: 74.8425, source: 'station' },
  { id: 'sc', code: 'SC', name: 'Hyderabad', detail: 'Secunderabad Junction', lat: 17.4344, lng: 78.5013, source: 'station' },
  { id: 'pune', code: 'PUNE', name: 'Pune', detail: 'Pune Junction', lat: 18.5289, lng: 73.8744, source: 'station' },
  { id: 'cstm', code: 'CSMT', name: 'Mumbai', detail: 'Chhatrapati Shivaji Maharaj Terminus', lat: 18.9398, lng: 72.8355, source: 'station' },
  { id: 'ndls', code: 'NDLS', name: 'New Delhi', detail: 'New Delhi Railway Station', lat: 28.6428, lng: 77.2199, source: 'station' },
]

const station = (id: string) => STATIONS.find((item) => item.id === id)!

export const ROUTE_PRESETS: RoutePreset[] = [
  { id: 'sbc-mys', origin: station('sbc'), destination: station('mys'), label: 'Morning through Mandya', durationMinutes: 135 },
  { id: 'ubl-mao', origin: station('ubl'), destination: station('mao'), label: 'Across the Western Ghats', durationMinutes: 250 },
  { id: 'mas-sbc', origin: station('mas'), destination: station('sbc'), label: 'The southern line', durationMinutes: 300 },
  { id: 'pune-cstm', origin: station('pune'), destination: station('cstm'), label: 'Down to the coast', durationMinutes: 205 },
]

export const DEFAULT_ORIGIN = station('sbc')
export const DEFAULT_DESTINATION = station('mys')
