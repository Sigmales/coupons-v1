import axios from 'axios'

const API_FOOTBALL_KEY = import.meta.env.VITE_API_FOOTBALL_KEY
const API_FOOTBALL_BASE = 'https://v3.football.api-sports.io'

export const fetchTodayMatches = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const response = await axios.get(`${API_FOOTBALL_BASE}/fixtures`, {
      params: { date: today },
      headers: {
        'x-rapidapi-key': API_FOOTBALL_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    })
    return response.data.response
  } catch (error) {
    console.error('API Football error:', error)
    return fetchFromTheSportsDB()
  }
}

const fetchFromTheSportsDB = async () => {
  try {
    const response = await axios.get('https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=4328')
    return response.data.events
  } catch (error) {
    console.error('TheSportsDB error:', error)
    return []
  }
}

