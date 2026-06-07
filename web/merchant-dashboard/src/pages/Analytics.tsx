import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { getMerchantStats, getTopCampaigns } from '../lib/api'

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('week')
  const [stats, setStats] = useState<any>(null)
  const [topCampaigns, setTopCampaigns] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const coffeeGold = '#D4A373'
  const COLORS = [coffeeGold, '#2196F3', '#4CAF50', '#FF9800', '#9C27B0']

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const [statsRes, topRes] = await Promise.all([
        getMerchantStats(),
        getTopCampaigns(),
      ])
      setStats(statsRes.data)
      setTopCampaigns(topRes.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LinearProgress sx={{ bgcolor: coffeeGold }} />
  }

  const scanData = [
    { date: 'Mon', scans: 45, unique_users: 32 },
    { date: 'Tue', scans: 52, unique_users: 38 },
    { date: 'Wed', scans: 48, unique_users: 35 },
    { date: 'Thu', scans: 61, unique_users: 42 },
    { date: 'Fri', scans: 78, unique_users: 51 },
    { date: 'Sat', scans: 89, unique_users: 58 },
    { date: 'Sun', scans: 67, unique_users: 44 },
  ]

  const demographics = [
    { name: '0-100 pts', value: 45 },
    { name: '101-500 pts', value: 28 },
    { name: '501-1000 pts', value: 15 },
    { name: '1000+ pts', value: 12 },
  ]

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ color: coffeeGold, fontWeight: 'bold' }}>
          Analytics
        </Typography>
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel sx={{ color: '#A5A19E' }}>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
            sx={{ color: coffeeGold }}
          >
            <MenuItem value="week">Last 7 Days</MenuItem>
            <MenuItem value="month">Last 30 Days</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ bgcolor: '#1A120B', border: `1px solid ${coffeeGold}30`, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: coffeeGold }}>
                Scan Activity
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={scanData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#A5A19E" />
                  <YAxis stroke="#A5A19E" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A120B', border: `1px solid ${coffeeGold}30` }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="scans" stroke={coffeeGold} name="Total Scans" strokeWidth={2} />
                  <Line type="monotone" dataKey="unique_users" stroke="#2196F3" name="Unique Users" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#1A120B', border: `1px solid ${coffeeGold}30`, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: coffeeGold }}>
                User Demographics
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={demographics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {demographics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#1A120B', border: `1px solid ${coffeeGold}30`, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: coffeeGold }}>
                Top Campaigns
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCampaigns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#A5A19E" />
                  <YAxis stroke="#A5A19E" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A120B', border: `1px solid ${coffeeGold}30` }}
                  />
                  <Bar dataKey="scans" fill={coffeeGold} name="Scans" />
                  <Bar dataKey="redemptions" fill="#FF9800" name="Redemptions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {stats && (
        <Grid item xs={12} sx={{ mt: 3 }}>
          <Card sx={{ bgcolor: '#1A120B', border: `1px solid ${coffeeGold}30`, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: coffeeGold }}>
                Performance Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="#A5A19E">Total Scans</Typography>
                  <Typography variant="h5" sx={{ color: coffeeGold }}>{stats.total_scans}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="#A5A19E">Active Users</Typography>
                  <Typography variant="h5" sx={{ color: coffeeGold }}>{stats.active_users}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="#A5A19E">Conversion Rate</Typography>
                  <Typography variant="h5" sx={{ color: coffeeGold }}>{stats.conversion_rate}%</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="#A5A19E">Expected Revenue</Typography>
                  <Typography variant="h5" sx={{ color: coffeeGold }}>{stats.expected_revenue} SR</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Box>
  )
}
