import { Box, Container, Typography, Link, Grid } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function Footer() {
  const coffeeGold = '#D4A373'

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#0D0806',
        borderTop: `1px solid ${coffeeGold}20`,
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" sx={{ color: coffeeGold, fontWeight: 'bold', mb: 2 }}>
              Walleo
            </Typography>
            <Typography variant="body2" sx={{ color: '#A5A19E', lineHeight: 1.8 }}>
              Modern loyalty platform empowering businesses to create rewarding customer experiences.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" sx={{ color: coffeeGold, fontWeight: 600, mb: 2 }}>
              Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link component={RouterLink} to="/about" sx={{ color: '#A5A19E', textDecoration: 'none', '&:hover': { color: coffeeGold } }}>
                About
              </Link>
              <Link component={RouterLink} to="/contact" sx={{ color: '#A5A19E', textDecoration: 'none', '&:hover': { color: coffeeGold } }}>
                Contact
              </Link>
              <Link component={RouterLink} to="/faq" sx={{ color: '#A5A19E', textDecoration: 'none', '&:hover': { color: coffeeGold } }}>
                FAQ
              </Link>
              <Link component={RouterLink} to="/support" sx={{ color: '#A5A19E', textDecoration: 'none', '&:hover': { color: coffeeGold } }}>
                Support
              </Link>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" sx={{ color: coffeeGold, fontWeight: 600, mb: 2 }}>
              Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link component={RouterLink} to="/privacy" sx={{ color: '#A5A19E', textDecoration: 'none', '&:hover': { color: coffeeGold } }}>
                Privacy Policy
              </Link>
              <Link component={RouterLink} to="/terms" sx={{ color: '#A5A19E', textDecoration: 'none', '&:hover': { color: coffeeGold } }}>
                Terms of Service
              </Link>
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${coffeeGold}20`, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#706B68' }}>
            &copy; {new Date().getFullYear()} Walleo. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
