import { useState, useEffect } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material'
import {
  TrendingUp,
  Campaign,
  QrCode,
  EmojiEvents,
} from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getMerchantStats, getRecentActivity } from '../lib/api'

interface Stats {
  total_campaigns: number
  total_scans: number
  active_users: number
  conversion_rate: number
  expected_revenue: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    total_campaigns: 0,
    total_scans: 0,
    active_users: 0,
    conversion_rate: 0,
    expected_revenue: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        getMerchantStats(),
        getRecentActivity(),
      ])
      setStats(statsRes.data)
      setRecentActivity(activityRes.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const coffeeGold = '#D4A373'

  const statCards = [
    { title: 'Active Campaigns', value: stats.total_campaigns, icon: Campaign, color: coffeeGold },
    { title: 'Total Scans', value: stats.total_scans, icon: QrCode, color: '#2196F3' },
    { title: 'Conversion Rate', value: `${stats.conversion_rate}%`, icon: TrendingUp, color: '#4CAF50' },
    { title: 'Expected Revenue', value: `${stats.expected_revenue} SR`, icon: EmojiEvents, color: '#FF9800' },
  ]

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <LinearProgress sx={{ width: 200 }} />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: coffeeGold, fontWeight: 'bold', mb: 3 }}>
        Merchant Dashboard
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ bgcolor: '#1A120B', border: `1px solid ${coffeeGold}30`, borderRadius: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="#A5A19E" gutterBottom variant="body2">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ color: stat.color, fontWeight: 'bold' }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <stat.icon sx={{ color: stat.color, fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Card sx={{ bgcolor: '#1A120B', border: `1px solid ${coffeeGold}30`, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: coffeeGold }}>
                Recent Activity
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={recentActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#A5A19E" />
                  <YAxis stroke="#A5A19E" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A120B', border: `1px solid ${coffeeGold}30` }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="scans" stroke={coffeeGold} name="Scans" strokeWidth={2} />
                  <Line type="monotone" dataKey="points" stroke="#4CAF50" name="Points Earned" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
