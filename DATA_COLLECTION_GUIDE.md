# Broadway Price Data Collection Guide

## Overview
This system is designed for 100% accurate Broadway ticket price data. Instead of scraping (which is unreliable), we manually collect and verify real prices.

## How to Collect Data

### Step 1: Go to Data Entry Page
Navigate to `/admin` in your Broadway Helper app.

### Step 2: Open Ticket Websites
Open these sites in separate tabs:
- **Telecharge.com** - Official Broadway tickets
- **StubHub.com** - Major resale market
- **SeatGeek.com** - Resale with "Deal Score"
- **VividSeats.com** - Another resale option

### Step 3: Search for a Show
1. Pick a show (e.g., "Maybe Happy Ending")
2. Select a specific date
3. Look at available seats

### Step 4: Record Exact Prices
For EACH available seat/section:
1. Section name (e.g., "Orchestra Center")
2. Row letter/number
3. Seat numbers (if shown)
4. Base ticket price
5. Service fees (IMPORTANT - these vary!)
6. Total price (price + fees)

### Step 5: Enter Data
Use the admin form to enter each price point:
- Fill in all fields accurately
- Check "Verified" if you saw it yourself
- Add notes for anything unusual

## What to Look For

### Price Anomalies
- Same seats priced differently on different sites
- "Premium" rows that cost less than regular rows
- Huge markups on resale sites

### Patterns
- Which sections are most expensive?
- How much do fees add to the total?
- Weekend vs weekday pricing

## Example Data Collection

**Show**: Maybe Happy Ending  
**Date**: 2025-01-15  
**Time**: 8:00 PM

**Telecharge (Official)**
- Orchestra Center Row B: $279 + $35 fees = $314
- Orchestra Center Row M: $179 + $25 fees = $204
- Mezzanine Row A: $149 + $20 fees = $169

**StubHub (Resale)**
- Orchestra Center Row B: $389 + $97 fees = $486 (54% markup!)
- Orchestra Center Row M: $249 + $62 fees = $311 (52% markup)
- Mezzanine Row A: $199 + $50 fees = $249 (47% markup)

## Tips for Accuracy

1. **Always include fees** - The advertised price is not the real price
2. **Check multiple dates** - Prices vary by day of week
3. **Note sold out sections** - This affects resale prices
4. **Screenshot unusual prices** - For verification
5. **Update regularly** - Prices change daily

## Building the Database

Goal: Collect at least 50 price points per show across different:
- Dates (weekday vs weekend)
- Sections (Orchestra, Mezzanine, Balcony)
- Sources (Official vs resale)

This will give us enough data to:
- Show accurate price comparisons
- Identify best deals
- Spot pricing anomalies
- Help people save money

## Next Steps

1. Start with 1-2 popular shows
2. Collect data for the next 2 weeks of performances
3. Compare official vs resale prices
4. Document interesting findings
5. Expand to more shows as we validate the approach