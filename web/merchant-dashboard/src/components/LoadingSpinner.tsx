import { Box, CircularProgress } from '@mui/material'

const coffeeGold = '#D4A373'

export default function LoadingSpinner() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#100B08',
      }}
    >
      <CircularProgress sx={{ color: coffeeGold }} />
    </Box>
  )
}
