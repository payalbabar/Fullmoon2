# Demo Video Script (2–5 minutes)

## Before Recording
- Open the production URL in Chrome/Brave
- Have 1AM Wallet extension installed and connected to Preview Network
- Have some testnet tNIGHT in your wallet
- Clear localStorage to trigger onboarding: `localStorage.removeItem('midnight_lottery_onboarding_complete')`

---

## Recording Script

### Introduction (0:00 – 0:30)
> "This is the Midnight Privacy Lottery — a decentralized lottery dApp built on Midnight Network using Compact zero-knowledge smart contracts."
>
> "Unlike traditional lotteries, all ticket entries and prize claims are completely private. Let me show you how it works."

### Onboarding Flow (0:30 – 1:00)
- Show the onboarding modal appearing for first-time users
- Click through all 5 steps, briefly narrating each:
  - Welcome screen
  - How the lottery works
  - Why ZK privacy matters
  - Wallet setup instructions
  - Ready to play

### Wallet Connection (1:00 – 1:30)
- Click "Connect 1AM Wallet" button
- Show the 1AM Wallet popup
- Approve connection
- Point out: wallet name, address, and Preview network badge displayed in the header

### Buy Ticket (1:30 – 2:30)
- Click "Buy Ticket via 1AM Wallet (1 tNIGHT)"
- Show the ZK proof generation overlay ("Generating Zero-Knowledge Proof")
- Point out: ticket count increased (optimistic update)
- Show the ZK commitment displayed under "Your Active Ticket ZK Witness"
- Show the transaction confirmation card at the bottom
> "The ticket salt was generated locally and hashed into a commitment. Only the hash is stored on-chain — my secret is never revealed."

### Indexer Sync (2:30 – 3:00)
- Click "Sync Live Indexer"
- Show the spinning refresh icon
- Point out: pot balance and ticket count update from the live indexer
> "The frontend polls the Midnight Preview indexer every 12 seconds. You can also manually trigger a sync."

### Feedback Widget (3:00 – 3:30)
- Click the purple chat icon (bottom-right)
- Rate 4 stars
- Select "UX" category
- Type a short comment
- Submit
- Show success confirmation

### Mobile Responsiveness (3:30 – 4:00)
- Resize browser to mobile width (~375px)
- Show header stacking vertically
- Show cards stacking to single column
- Show buttons and text adapting

### Closing (4:00 – 4:30)
> "This app includes Sentry error monitoring, Plausible analytics, a 5-step onboarding flow, and feedback collection — all production-ready."
>
> "The smart contract is deployed on Midnight Preview Network with contract ID shown in the header."
>
> "Thank you for watching!"

---

## Recording Tips
- Use OBS Studio, Loom, or screen recording built into your OS
- Resolution: 1920×1080 preferred
- Keep the video under 5 minutes
- Export as MP4 or upload directly to YouTube/Loom
