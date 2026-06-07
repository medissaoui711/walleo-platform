import { useState } from 'react'
import {
  Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails, Paper,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Footer from '../components/Footer'

const faqs = [
  {
    q: 'How do I create a loyalty campaign?',
    a: 'Navigate to the Campaigns page from the sidebar and click "Create Campaign". Fill in the details such as campaign name, description, start and end dates, and reward rules. Once submitted, the campaign will be active for your customers.',
  },
  {
    q: 'How does the stamp-based loyalty engine work?',
    a: 'Customers earn a stamp for each qualifying purchase. When they collect 5 stamps, they can redeem 100 loyalty points. On the 6th stamp, they earn a 250-point bonus and the counter resets to 1 stamp.',
  },
  {
    q: 'Can I view analytics for my campaigns?',
    a: 'Yes! The Analytics page provides detailed insights including total stamps issued, points redeemed, top-performing campaigns, and recent customer activity visualized with interactive charts.',
  },
  {
    q: 'How do I update my merchant profile?',
    a: 'Go to the Settings page where you can update your business name, email, phone number, notification preferences, language settings, and change your password.',
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. We use industry-standard encryption for all data in transit and at rest. Your customer information and business data are stored securely and never shared with third parties.',
  },
  {
    q: 'How does the geofencing feature work?',
    a: 'When customers have the Walleo Android app and grant location permissions, they receive push notifications when they enter a defined radius around your business location, reminding them of available loyalty rewards.',
  },
  {
    q: 'Can I have multiple active campaigns?',
    a: 'Yes, you can run multiple campaigns simultaneously. Each campaign has its own rules, stamps, and reward structure. Monitor them all from the Campaigns dashboard.',
  },
  {
    q: 'How do I reset my password?',
    a: ' click on the "Forgot Password" link on the login page. Enter your registered email address, and we will send you a password reset link.',
  },
]

export default function FAQ() {
  const [expanded, setExpanded] = useState<string | false>(false)

  const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

  return (
    <Box sx={{ bgcolor: '#100B08', minHeight: '100vh' }}>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 6, bgcolor: '#1A120B' }}>
          <Typography variant="h3" sx={{ color: '#D4A373', mb: 4, fontWeight: 'bold' }}>
            Frequently Asked Questions
          </Typography>
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
              sx={{
                bgcolor: 'transparent',
                color: '#C9C4C0',
                borderBottom: '1px solid #D4A37320',
                boxShadow: 'none',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#D4A373' }} />}>
                <Typography sx={{ color: '#D4A373', fontWeight: 500 }}>{faq.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ color: '#A5A19E', lineHeight: 1.8 }}>{faq.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      </Container>
      <Footer />
    </Box>
  )
}
