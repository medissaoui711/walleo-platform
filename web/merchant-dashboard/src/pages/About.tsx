import { Box, Container, Typography, Paper, Grid, Card, CardContent } from '@mui/material'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import PeopleIcon from '@mui/icons-material/People'
import SecurityIcon from '@mui/icons-material/Security'
import SpeedIcon from '@mui/icons-material/Speed'
import Footer from '../components/Footer'

const values = [
  {
    icon: PeopleIcon,
    title: 'Customer First',
    desc: 'We build tools that help businesses create meaningful relationships with their customers through rewarding loyalty experiences.',
  },
  {
    icon: EmojiEventsIcon,
    title: 'Innovation',
    desc: 'We continuously improve our platform with the latest technology including geofencing, real-time analytics, and AI-driven insights.',
  },
  {
    icon: SecurityIcon,
    title: 'Trust & Security',
    desc: 'Your data and your customers\' privacy are our top priority. We employ industry-leading security practices across all systems.',
  },
  {
    icon: SpeedIcon,
    title: 'Performance',
    desc: 'Our platform is built for speed and reliability, ensuring your loyalty programs run smoothly even at scale.',
  },
]

export default function About() {
  return (
    <Box sx={{ bgcolor: '#100B08', minHeight: '100vh' }}>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 6, bgcolor: '#1A120B', mb: 6 }}>
          <Typography variant="h3" sx={{ color: '#D4A373', mb: 4, fontWeight: 'bold' }}>
            About Walleo
          </Typography>
          <Typography variant="body1" sx={{ color: '#C9C4C0', mb: 3, lineHeight: 1.8 }}>
            Walleo is a modern loyalty platform that empowers businesses to create, manage, and
            optimize their customer loyalty programs. Our mission is to make loyalty rewarding for
            both businesses and their customers.
          </Typography>
          <Typography variant="body1" sx={{ color: '#C9C4C0', mb: 3, lineHeight: 1.8 }}>
            Founded in 2025, we combine a powerful merchant dashboard with a seamless customer
            mobile app, enabling real-time engagement through stamp-based rewards, push
            notifications, and geofencing technology.
          </Typography>
          <Typography variant="body1" sx={{ color: '#C9C4C0', lineHeight: 1.8 }}>
            Whether you run a single coffee shop or a chain of stores, Walleo provides the tools
            you need to build lasting customer loyalty.
          </Typography>
        </Paper>

        <Typography variant="h4" sx={{ color: '#D4A373', mb: 4, textAlign: 'center', fontWeight: 600 }}>
          Our Values
        </Typography>
        <Grid container spacing={3}>
          {values.map((v) => (
            <Grid item xs={12} sm={6} key={v.title}>
              <Card sx={{ bgcolor: '#1A120B', border: '1px solid #D4A37320', height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <v.icon sx={{ color: '#D4A373', fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#D4A373', mb: 1, fontWeight: 600 }}>
                    {v.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#A5A19E', lineHeight: 1.8 }}>
                    {v.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Footer />
    </Box>
  )
}
