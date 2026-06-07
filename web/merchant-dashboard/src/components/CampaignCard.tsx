import React from 'react'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
} from '@mui/material'
import { Edit, Delete, QrCode, LocationOn } from '@mui/icons-material'
import { truncate, hexToRgba } from '../lib/utils'

export interface CampaignData {
  id: number
  merchant_name: string
  merchant_name_ar: string
  coupon_title: string
  coupon_title_ar: string
  coupon_description?: string
  discount_code: string
  is_active: boolean
  latitude: number
  longitude: number
  geofence_radius: number
  color_hex: string
  start_date?: string
  end_date?: string
}

interface CampaignCardProps {
  campaign: CampaignData
  onEdit: (campaign: CampaignData) => void
  onDelete: (id: number) => void
  onGenerateQR: (id: number) => void
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onEdit, onDelete, onGenerateQR }) => {
  const bgColor = hexToRgba(campaign.color_hex || '#D4A373', 0.08)

  return (
    <Card sx={{ borderLeft: 4, borderColor: campaign.color_hex || '#D4A373' }}>
      <CardContent sx={{ bgcolor: bgColor }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography variant="h6">{campaign.merchant_name}</Typography>
            <Typography variant="body2" color="textSecondary" dir="rtl">
              {campaign.merchant_name_ar}
            </Typography>
            <Typography variant="subtitle1" fontWeight={500} mt={1}>
              {campaign.coupon_title}
            </Typography>
            <Typography variant="caption" color="textSecondary" display="block">
              {truncate(campaign.coupon_description || '', 60)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
            <Chip
              label={campaign.is_active ? 'Active' : 'Inactive'}
              color={campaign.is_active ? 'success' : 'default'}
              size="small"
            />
            <Chip
              icon={<LocationOn fontSize="small" />}
              label={`${campaign.geofence_radius}m`}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>
        <Box mt={1}>
          <Typography variant="body2" fontFamily="monospace" color="primary">
            Code: <strong>{campaign.discount_code}</strong>
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 1 }}>
        <Button size="small" startIcon={<QrCode />} onClick={() => onGenerateQR(campaign.id)}>
          QR
        </Button>
        <IconButton size="small" onClick={() => onEdit(campaign)}>
          <Edit fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(campaign.id)} color="error">
          <Delete fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  )
}

export default CampaignCard
