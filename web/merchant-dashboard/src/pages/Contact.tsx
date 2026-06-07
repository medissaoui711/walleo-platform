import { useState } from 'react'
import {
  Box, Container, Typography, Paper, TextField, Button, Grid, Alert,
} from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import Footer from '../components/Footer'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <Box sx={{ bgcolor: '#100B08', minHeight: '100vh' }}>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 6, bgcolor: '#1A120B' }}>
          <Typography variant="h3" sx={{ color: '#D4A373', mb: 4, fontWeight: 'bold' }}>
            Contact Us
          </Typography>
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              {submitted ? (
                <Alert severity="success" sx={{ bgcolor: '#D4A37320', color: '#D4A373' }}>
                  Thank you for your message! We will get back to you within 24 hours.
                </Alert>
              ) : (
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    variant="outlined"
                    required
                    sx={{ mb: 2 }}
                    InputLabelProps={{ style: { color: '#A5A19E' } }}
                    InputProps={{ sx: { color: '#C9C4C0', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D4A37340' } } }}
                  />
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    required
                    sx={{ mb: 2 }}
                    InputLabelProps={{ style: { color: '#A5A19E' } }}
                    InputProps={{ sx: { color: '#C9C4C0', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D4A37340' } } }}
                  />
                  <TextField
                    fullWidth
                    label="Subject"
                    variant="outlined"
                    required
                    sx={{ mb: 2 }}
                    InputLabelProps={{ style: { color: '#A5A19E' } }}
                    InputProps={{ sx: { color: '#C9C4C0', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D4A37340' } } }}
                  />
                  <TextField
                    fullWidth
                    label="Message"
                    multiline
                    rows={4}
                    variant="outlined"
                    required
                    sx={{ mb: 3 }}
                    InputLabelProps={{ style: { color: '#A5A19E' } }}
                    InputProps={{ sx: { color: '#C9C4C0', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D4A37340' } } }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: '#D4A373',
                      color: '#1A120B',
                      fontWeight: 'bold',
                      py: 1.5,
                      '&:hover': { bgcolor: '#C49A6C' },
                    }}
                  >
                    Send Message
                  </Button>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <EmailIcon sx={{ color: '#D4A373', fontSize: 28 }} />
                <Box>
                  <Typography sx={{ color: '#D4A373', fontWeight: 600 }}>Email</Typography>
                  <Typography sx={{ color: '#A5A19E' }}>support@walleo.com</Typography>
                </Box>
              </Box>
              <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <PhoneIcon sx={{ color: '#D4A373', fontSize: 28 }} />
                <Box>
                  <Typography sx={{ color: '#D4A373', fontWeight: 600 }}>Phone</Typography>
                  <Typography sx={{ color: '#A5A19E' }}>+1 (555) 123-4567</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocationOnIcon sx={{ color: '#D4A373', fontSize: 28 }} />
                <Box>
                  <Typography sx={{ color: '#D4A373', fontWeight: 600 }}>Office</Typography>
                  <Typography sx={{ color: '#A5A19E' }}>
                    123 Business Ave, Suite 200<br />
                    San Francisco, CA 94105
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
      <Footer />
    </Box>
  )
}
