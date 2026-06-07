import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  LinearProgress,
} from '@mui/material'
import { Add, Edit, Delete, QrCode } from '@mui/icons-material'
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign } from '../lib/api'
import toast from 'react-hot-toast'

interface Campaign {
  id: number
  merchant_name: string
  merchant_name_ar: string
  coupon_title: string
  coupon_title_ar: string
  discount_code: string
  is_active: boolean
  latitude: number
  longitude: number
  geofence_radius: number
  color_hex: string
  start_date: string
  end_date: string
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [formData, setFormData] = useState({
    merchant_name: '',
    merchant_name_ar: '',
    coupon_title: '',
    coupon_title_ar: '',
    coupon_description: '',
    coupon_description_ar: '',
    discount_code: '',
    latitude: 0,
    longitude: 0,
    geofence_radius: 100,
    color_hex: '#D4A373',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })

  const coffeeGold = '#D4A373'

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await getCampaigns()
      setCampaigns(response.data)
    } catch (error) {
      toast.error('Failed to fetch campaigns')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (editingCampaign) {
        await updateCampaign(editingCampaign.id, formData)
        toast.success('Campaign updated')
      } else {
        await createCampaign(formData)
        toast.success('Campaign created')
      }
      fetchCampaigns()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error('Failed to save campaign')
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign(id)
        toast.success('Campaign deleted')
        fetchCampaigns()
      } catch (error) {
        toast.error('Failed to delete campaign')
      }
    }
  }

  const resetForm = () => {
    setEditingCampaign(null)
    setFormData({
      merchant_name: '',
      merchant_name_ar: '',
      coupon_title: '',
      coupon_title_ar: '',
      coupon_description: '',
      coupon_description_ar: '',
      discount_code: '',
      latitude: 0,
      longitude: 0,
      geofence_radius: 100,
      color_hex: '#D4A373',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
  }

  if (isLoading) {
    return <LinearProgress sx={{ bgcolor: coffeeGold }} />
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ color: coffeeGold, fontWeight: 'bold' }}>
          Campaigns
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            resetForm()
            setDialogOpen(true)
          }}
          sx={{ bgcolor: coffeeGold, color: '#1A120B', '&:hover': { bgcolor: '#C49A6C' } }}
        >
          New Campaign
        </Button>
      </Box>

      <Grid container spacing={3}>
        {campaigns.map((campaign) => (
          <Grid item xs={12} md={6} key={campaign.id}>
            <Card sx={{ bgcolor: '#1A120B', border: `1px solid ${coffeeGold}30`, borderRadius: 3 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6" sx={{ color: coffeeGold }}>
                      {campaign.merchant_name}
                    </Typography>
                    <Typography variant="body2" color="#A5A19E" gutterBottom>
                      {campaign.merchant_name_ar}
                    </Typography>
                  </Box>
                  <Chip
                    label={campaign.is_active ? 'Active' : 'Inactive'}
                    color={campaign.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
                <Typography variant="body1" sx={{ mt: 2, color: '#FFF' }}>
                  {campaign.coupon_title}
                </Typography>
                <Typography variant="body2" color="#A5A19E">
                  Code: <strong style={{ color: coffeeGold }}>{campaign.discount_code}</strong>
                </Typography>
                <Box mt={2} display="flex" gap={1}>
                  <IconButton size="small" color="primary">
                    <QrCode />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditingCampaign(campaign)
                      setFormData(campaign)
                      setDialogOpen(true)
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(campaign.id)}>
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1A120B', color: coffeeGold }}>
          {editingCampaign ? 'Edit Campaign' : 'New Campaign'}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#1A120B' }}>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Merchant Name (English)"
              fullWidth
              value={formData.merchant_name}
              onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
              InputLabelProps={{ style: { color: '#A5A19E' } }}
            />
            <TextField
              label="Merchant Name (Arabic)"
              fullWidth
              value={formData.merchant_name_ar}
              onChange={(e) => setFormData({ ...formData, merchant_name_ar: e.target.value })}
              InputLabelProps={{ style: { color: '#A5A19E' } }}
            />
            <TextField
              label="Coupon Title (English)"
              fullWidth
              value={formData.coupon_title}
              onChange={(e) => setFormData({ ...formData, coupon_title: e.target.value })}
              InputLabelProps={{ style: { color: '#A5A19E' } }}
            />
            <TextField
              label="Coupon Title (Arabic)"
              fullWidth
              value={formData.coupon_title_ar}
              onChange={(e) => setFormData({ ...formData, coupon_title_ar: e.target.value })}
              InputLabelProps={{ style: { color: '#A5A19E' } }}
            />
            <TextField
              label="Discount Code"
              fullWidth
              value={formData.discount_code}
              onChange={(e) => setFormData({ ...formData, discount_code: e.target.value.toUpperCase() })}
              InputLabelProps={{ style: { color: '#A5A19E' } }}
            />
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              InputLabelProps={{ style: { color: '#A5A19E' } }}
            />
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              InputLabelProps={{ style: { color: '#A5A19E' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1A120B' }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ bgcolor: coffeeGold, color: '#1A120B' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
