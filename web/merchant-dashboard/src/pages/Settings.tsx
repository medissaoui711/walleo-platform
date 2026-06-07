import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  CircularProgress,
} from '@mui/material'
import { Save, Person, Security, Notifications, Language } from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function Settings() {
  const { merchant } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [profile, setProfile] = useState({
    name: '',
    name_ar: '',
    email: '',
    phone: '',
    address: '',
  })

  const [notifications, setNotifications] = useState({
    email_alerts: true,
    push_notifications: true,
    weekly_report: true,
    geofence_alerts: true,
  })

  const [language, setLanguage] = useState('ar')

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const coffeeGold = '#D4A373'

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/api/v1/merchant/settings')
      const data = response.data
      setProfile({
        name: data.name || '',
        name_ar: data.name_ar || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
      })
      setNotifications({
        email_alerts: data.email_alerts ?? true,
        push_notifications: data.push_notifications ?? true,
        weekly_report: data.weekly_report ?? true,
        geofence_alerts: data.geofence_alerts ?? true,
      })
      setLanguage(data.language || 'ar')
    } catch (error) {
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      await api.put('/api/v1/merchant/settings/profile', profile)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsSaving(true)
    try {
      await api.put('/api/v1/merchant/settings/notifications', notifications)
      toast.success('Notification settings updated')
    } catch (error) {
      toast.error('Failed to update notification settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match')
      return
    }
    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsSaving(true)
    try {
      await api.put('/api/v1/merchant/settings/password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      })
      toast.success('Password changed successfully')
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to change password')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangeLanguage = async (lang: string) => {
    setLanguage(lang)
    try {
      await api.put('/api/v1/merchant/settings/language', { language: lang })
      toast.success(`Language changed to ${lang === 'ar' ? 'Arabic' : 'English'}`)
      window.location.reload()
    } catch (error) {
      toast.error('Failed to change language')
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: coffeeGold }} />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: coffeeGold, fontWeight: 'bold', mb: 3 }}>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#1A120B', border: `1px solid ${coffeeGold}30`, borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Person sx={{ color: coffeeGold }} />
                <Typography variant="h6" sx={{ color: coffeeGold }}>
                  Profile Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 3, bgcolor: `${coffeeGold}30` }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Store Name (English)"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    InputLabelProps={{ style: { color: '#A5A19E' } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Store Name (Arabic)"
                    value={profile.name_ar}
                    onChange={(e) => setProfile({ ...profile, name_ar: e.target.value })}
                    InputLabelProps={{ style: { color: '#A5A19E' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    InputLabelProps={{ style: { color: '#A5A19E' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    InputLabelProps={{ style: { color: '#A5A19E' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={2}
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    InputLabelProps={{ style: { color: '#A5A19E' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    sx={{
                      bgcolor: coffeeGold,
                      color: '#1A120B',
                      '&:hover': { bgcolor: '#C49A6C' },
                    }}
                  >
                    {isSaving ? <CircularProgress size={24} /> : 'Save Profile'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#1A120B', border: `1px solid ${coffeeGold}30`, borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Security sx={{ color: coffeeGold }} />
                <Typography variant="h6" sx={{ color: coffeeGold }}>
                  Security
                </Typography>
              </Box>
              <Divider sx={{ mb: 3, bgcolor: `${coffeeGold}30` }} />

              <Typography variant="body2" sx={{ color: '#A5A19E', mb: 2 }}>
                Change Password
              </Typography>

              <TextField
                fullWidth
                label="Current Password"
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                sx={{ mb: 2 }}
                InputLabelProps={{ style: { color: '#A5A19E' } }}
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                sx={{ mb: 2 }}
                InputLabelProps={{ style: { color: '#A5A19E' } }}
                helperText="Minimum 8 characters"
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                sx={{ mb: 2 }}
                InputLabelProps={{ style: { color: '#A5A19E' } }}
              />
              <Button
                variant="contained"
                onClick={handleChangePassword}
                disabled={isSaving || !passwordData.current_password || !passwordData.new_password}
                sx={{
                  bgcolor: coffeeGold,
                  color: '#1A120B',
                  '&:hover': { bgcolor: '#C49A6C' },
                }}
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#1A120B', border: `1px solid ${coffeeGold}30`, borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Notifications sx={{ color: coffeeGold }} />
                <Typography variant="h6" sx={{ color: coffeeGold }}>
                  Notifications
                </Typography>
              </Box>
              <Divider sx={{ mb: 3, bgcolor: `${coffeeGold}30` }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.email_alerts}
                    onChange={(e) => setNotifications({ ...notifications, email_alerts: e.target.checked })}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: coffeeGold } }}
                  />
                }
                label="Email Alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.push_notifications}
                    onChange={(e) => setNotifications({ ...notifications, push_notifications: e.target.checked })}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: coffeeGold } }}
                  />
                }
                label="Push Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.weekly_report}
                    onChange={(e) => setNotifications({ ...notifications, weekly_report: e.target.checked })}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: coffeeGold } }}
                  />
                }
                label="Weekly Report"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.geofence_alerts}
                    onChange={(e) => setNotifications({ ...notifications, geofence_alerts: e.target.checked })}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: coffeeGold } }}
                  />
                }
                label="Geofence Alerts"
              />

              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveNotifications}
                disabled={isSaving}
                sx={{
                  mt: 2,
                  bgcolor: coffeeGold,
                  color: '#1A120B',
                  '&:hover': { bgcolor: '#C49A6C' },
                }}
              >
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#1A120B', border: `1px solid ${coffeeGold}30`, borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Language sx={{ color: coffeeGold }} />
                <Typography variant="h6" sx={{ color: coffeeGold }}>
                  Language / اللغة
                </Typography>
              </Box>
              <Divider sx={{ mb: 3, bgcolor: `${coffeeGold}30` }} />

              <Box display="flex" gap={2}>
                <Button
                  variant={language === 'ar' ? 'contained' : 'outlined'}
                  onClick={() => handleChangeLanguage('ar')}
                  sx={{
                    flex: 1,
                    bgcolor: language === 'ar' ? coffeeGold : 'transparent',
                    color: language === 'ar' ? '#1A120B' : coffeeGold,
                    borderColor: coffeeGold,
                    '&:hover': {
                      bgcolor: language === 'ar' ? '#C49A6C' : `${coffeeGold}20`,
                    },
                  }}
                >
                  العربية
                </Button>
                <Button
                  variant={language === 'en' ? 'contained' : 'outlined'}
                  onClick={() => handleChangeLanguage('en')}
                  sx={{
                    flex: 1,
                    bgcolor: language === 'en' ? coffeeGold : 'transparent',
                    color: language === 'en' ? '#1A120B' : coffeeGold,
                    borderColor: coffeeGold,
                    '&:hover': {
                      bgcolor: language === 'en' ? '#C49A6C' : `${coffeeGold}20`,
                    },
                  }}
                >
                  English
                </Button>
              </Box>

              <Alert severity="info" sx={{ mt: 2, bgcolor: `${coffeeGold}20`, color: coffeeGold }}>
                Changing language will refresh the dashboard
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
