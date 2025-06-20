# Broadway Price Tracker

A price transparency tool for Broadway tickets that helps users discover pricing anomalies and avoid resale markups.

## Key Features

🎯 **Price Anomaly Detection**: Finds unusual deals like Row B at $200 when other rows are $500+

⚠️ **Resale Warnings**: Alerts when resale sites are overcharging for tickets available on official sites

📅 **Calendar View**: Shows lowest price per day at a glance

💰 **Complete Price Comparison**: See ALL available tickets from both official and resale sources

🏆 **Audience Rewards**: Highlights official sources where you can earn points

## How It Works

1. **Search**: Select a show, date range, and preferred sections
2. **Compare**: View all available tickets across sources in one table
3. **Discover**: The system highlights:
   - Unusually low prices (price anomalies)
   - Resale overcharging (when same seats are cheaper on official sites)
   - Rare availability (like premium rows only available on specific dates)

## Example: Maybe Happy Ending

The app was inspired by a real scenario where:
- Most Orchestra Center seats cost $500+
- But on July 16th, Row B was available for only $204
- Resale sites were selling worse seats for $569
- This deal was only visible by checking day-by-day on Telecharge

## Running the App

```bash
npm install
npm run dev
```

Visit http://localhost:3000 to use the app.

## Technology Stack

- Next.js 14 with TypeScript
- Tailwind CSS for styling
- Mock data generation for demonstration
- Price anomaly detection algorithms

## Future Enhancements

- Real-time API integration with ticket sources
- Historical price tracking
- Price alerts for specific shows/dates
- Mobile app version