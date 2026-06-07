import React from 'react'
import { Card, CardContent, Typography, Box } from '@mui/material'

interface StatsCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color?: string
  subtitle?: string
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color = '#4CAF50', subtitle }) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4">{typeof value === 'number' ? value.toLocaleString() : value}</Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color, opacity: 0.8 }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default StatsCard
