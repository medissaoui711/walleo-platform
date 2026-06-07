import {
  Box, Container, Typography, Paper, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Footer from '../components/Footer'

const topics = [
  {
    title: 'Getting Started',
    content: 'After creating your merchant account, you can immediately start building campaigns. Use the Dashboard to get an overview of your performance, then navigate to Campaigns to create your first loyalty program.',
  },
  {
    title: 'Account & Billing',
    content: 'Manage your subscription and billing information from the Settings page. We offer monthly and annual plans. You can upgrade, downgrade, or cancel your plan at any time.',
  },
  {
    title: 'Technical Support',
    content: 'Our technical team is available 24/7 to assist with any platform issues. Contact us via email at support@walleo.com or use the Contact page to submit a ticket.',
  },
  {
    title: 'API Documentation',
    content: 'Developers can integrate with Walleo using our RESTful API. The API supports campaign management, customer data, analytics, and webhooks. Contact us for API access credentials.',
  },
  {
    title: 'Troubleshooting',
    content: 'If you encounter issues, try clearing your browser cache or using a different browser. For persistent problems, check our FAQ or contact support with details about the issue you are experiencing.',
  },
]

export default function Support() {
  return (
    <Box sx={{ bgcolor: '#100B08', minHeight: '100vh' }}>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 6, bgcolor: '#1A120B' }}>
          <Typography variant="h3" sx={{ color: '#D4A373', mb: 4, fontWeight: 'bold' }}>
            Support Center
          </Typography>
          <Typography variant="body1" sx={{ color: '#A5A19E', mb: 4, lineHeight: 1.8 }}>
            Need help? Browse our support topics below or reach out to our team.
          </Typography>
          {topics.map((topic, index) => (
            <Accordion
              key={index}
              sx={{
                bgcolor: 'transparent',
                color: '#C9C4C0',
                borderBottom: '1px solid #D4A37320',
                boxShadow: 'none',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#D4A373' }} />}>
                <Typography sx={{ color: '#D4A373', fontWeight: 500 }}>{topic.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ color: '#A5A19E', lineHeight: 1.8 }}>{topic.content}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      </Container>
      <Footer />
    </Box>
  )
}
