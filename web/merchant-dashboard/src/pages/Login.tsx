import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useAuth } from '../hooks/useAuth'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function Login() {
  const [tabValue, setTabValue] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [regName, setRegName] = useState('')
  const [regNameAr, setRegNameAr] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  const { login, register } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const success = await login(loginEmail, loginPassword)
    if (!success) {
      setError('Invalid email or password')
    }
    setIsLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const success = await register({
      name: regName,
      name_ar: regNameAr,
      email: regEmail,
      password: regPassword,
    })
    if (!success) {
      setError('Registration failed. Email may already exist.')
    }
    setIsLoading(false)
  }

  const coffeeGold = '#D4A373'

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1A120B 0%, #100B08 100%)',
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: '100%',
          mx: 2,
          borderRadius: 4,
          bgcolor: '#1A120B',
          border: `1px solid ${coffeeGold}30`,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                color: coffeeGold,
                fontWeight: 'bold',
                mb: 1,
              }}
            >
              Walleo
            </Typography>
            <Typography variant="body2" sx={{ color: '#A5A19E' }}>
              Merchant Dashboard
            </Typography>
          </Box>

          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
            <Tab label="Login" sx={{ flex: 1 }} />
            <Tab label="Register" sx={{ flex: 1 }} />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
                InputLabelProps={{ style: { color: '#A5A19E' } }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
                InputLabelProps={{ style: { color: '#A5A19E' } }}
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{
                  bgcolor: coffeeGold,
                  color: '#1A120B',
                  fontWeight: 'bold',
                  py: 1.5,
                  '&:hover': { bgcolor: '#C49A6C' },
                }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Login'}
              </Button>
            </form>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <form onSubmit={handleRegister}>
              <TextField
                fullWidth
                label="Store Name (English)"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
                sx={{ mb: 2 }}
                InputLabelProps={{ style: { color: '#A5A19E' } }}
              />
              <TextField
                fullWidth
                label="Store Name (Arabic)"
                value={regNameAr}
                onChange={(e) => setRegNameAr(e.target.value)}
                required
                sx={{ mb: 2 }}
                InputLabelProps={{ style: { color: '#A5A19E' } }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                sx={{ mb: 2 }}
                InputLabelProps={{ style: { color: '#A5A19E' } }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
                InputLabelProps={{ style: { color: '#A5A19E' } }}
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{
                  bgcolor: coffeeGold,
                  color: '#1A120B',
                  fontWeight: 'bold',
                  py: 1.5,
                  '&:hover': { bgcolor: '#C49A6C' },
                }}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Register'}
              </Button>
            </form>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  )
}
