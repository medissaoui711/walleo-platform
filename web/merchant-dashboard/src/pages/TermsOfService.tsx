import { Box, Container, Typography, Paper } from '@mui/material'
import Footer from '../components/Footer'

export default function TermsOfService() {
  return (
    <Box sx={{ bgcolor: '#100B08', minHeight: '100vh' }}>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 6, bgcolor: '#1A120B' }}>
          <Typography variant="h3" sx={{ color: '#D4A373', mb: 4, fontWeight: 'bold' }}>
            Terms of Service
          </Typography>
          <Typography variant="body1" sx={{ color: '#A5A19E', mb: 3, lineHeight: 1.8 }}>
            Last updated: June 2026
          </Typography>
          <Typography variant="h5" sx={{ color: '#D4A373', mb: 2, mt: 4, fontWeight: 600 }}>
            Acceptance of Terms
          </Typography>
          <Typography variant="body1" sx={{ color: '#C9C4C0', mb: 3, lineHeight: 1.8 }}>
            By accessing or using Walleo, you agree to be bound by these Terms of Service. If you
            do not agree, you may not use our platform.
          </Typography>
          <Typography variant="h5" sx={{ color: '#D4A373', mb: 2, mt: 4, fontWeight: 600 }}>
            Merchant Responsibilities
          </Typography>
          <Typography variant="body1" sx={{ color: '#C9C4C0', mb: 3, lineHeight: 1.8 }}>
            As a merchant, you are responsible for maintaining the confidentiality of your account
            credentials, ensuring the accuracy of campaign information, and complying with all
            applicable laws and regulations related to your loyalty program.
          </Typography>
          <Typography variant="h5" sx={{ color: '#D4A373', mb: 2, mt: 4, fontWeight: 600 }}>
            Service Availability
          </Typography>
          <Typography variant="body1" sx={{ color: '#C9C4C0', mb: 3, lineHeight: 1.8 }}>
            We strive to maintain 99.9% uptime, but we do not guarantee uninterrupted service.
            We reserve the right to modify, suspend, or discontinue any part of the platform with
            reasonable notice.
          </Typography>
          <Typography variant="h5" sx={{ color: '#D4A373', mb: 2, mt: 4, fontWeight: 600 }}>
            Limitation of Liability
          </Typography>
          <Typography variant="body1" sx={{ color: '#C9C4C0', mb: 3, lineHeight: 1.8 }}>
            Walleo shall not be liable for any indirect, incidental, or consequential damages
            arising from your use of the platform. Our total liability is limited to the fees you
            have paid us in the twelve months preceding the claim.
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </Box>
  )
}
