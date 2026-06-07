import { Box, Container, Typography, Paper } from '@mui/material'
import Footer from '../components/Footer'

export default function PrivacyPolicy() {
  return (
    <Box sx={{ bgcolor: '#100B08', minHeight: '100vh' }}>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 6, bgcolor: '#1A120B' }}>
          <Typography variant="h3" sx={{ color: '#D4A373', mb: 4, fontWeight: 'bold' }}>
            Privacy Policy
          </Typography>
          <Typography variant="body1" sx={{ color: '#A5A19E', mb: 3, lineHeight: 1.8 }}>
            Last updated: June 2026
          </Typography>
          <Typography variant="body1" sx={{ color: '#C9C4C0', mb: 3, lineHeight: 1.8 }}>
            Walleo ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your information when you use our
            platform.
          </Typography>
          <Typography variant="h5" sx={{ color: '#D4A373', mb: 2, mt: 4, fontWeight: 600 }}>
            Information We Collect
          </Typography>
          <Typography variant="body1" sx={{ color: '#C9C4C0', mb: 3, lineHeight: 1.8 }}>
            We collect personal information you provide to us, such as your name, email address,
            phone number, and business details when you register as a merchant. We also collect
            usage data including campaign performance, customer interactions, and analytics.
          </Typography>
          <Typography variant="h5" sx={{ color: '#D4A373', mb: 2, mt: 4, fontWeight: 600 }}>
            How We Use Your Information
          </Typography>
          <Typography variant="body1" sx={{ color: '#C9C4C0', mb: 3, lineHeight: 1.8 }}>
            Your information is used to provide and improve our loyalty platform services, process
            transactions, send administrative information, and comply with legal obligations. We do
            not sell your personal information to third parties.
          </Typography>
          <Typography variant="h5" sx={{ color: '#D4A373', mb: 2, mt: 4, fontWeight: 600 }}>
            Data Security
          </Typography>
          <Typography variant="body1" sx={{ color: '#C9C4C0', mb: 3, lineHeight: 1.8 }}>
            We implement industry-standard security measures to protect your data, including
            encryption at rest and in transit, regular security audits, and access controls.
          </Typography>
          <Typography variant="h5" sx={{ color: '#D4A373', mb: 2, mt: 4, fontWeight: 600 }}>
            Contact Us
          </Typography>
          <Typography variant="body1" sx={{ color: '#C9C4C0', mb: 3, lineHeight: 1.8 }}>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <Typography component="span" sx={{ color: '#D4A373' }}>
              privacy@walleo.com
            </Typography>
            .
          </Typography>
        </Paper>
      </Container>
      <Footer />
    </Box>
  )
}
