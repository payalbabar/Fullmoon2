# Screenshot Checklist for Submission

Capture the following screenshots for your Level 4 submission evidence.

## Required Screenshots

### 1. Landing Page (Desktop)
- Full browser screenshot at 1920×1080
- Shows: header with brand, wallet buttons, lottery cards

### 2. Onboarding Modal
- Screenshot of step 1 ("Welcome to Midnight Privacy Lottery")
- Screenshot of final step ("You're Ready to Play")

### 3. Wallet Connected State
- Header showing: wallet name (1AM Wallet), truncated address, Preview network badge
- Both wallet buttons (1AM + MetaMask) visible

### 4. Lottery Main View
- Prize pot card with live tNIGHT balance
- Ticket count and round ID from indexer
- "Buy Ticket" and "Draw Winner" buttons visible

### 5. ZK Proof Generation Overlay
- The full-screen proving modal with spinning CPU icon
- Text showing "Generating Zero-Knowledge Proof"

### 6. Ticket Purchase Confirmation
- "Your Active Ticket ZK Witness" section showing commitment hash
- Transaction confirmation card at bottom

### 7. Feedback Widget
- Feedback modal open with star rating, category buttons, comment field
- Feedback submitted success state

### 8. Mobile View (375px)
- Full page at mobile width
- Header stacked vertically
- Cards in single column

### 9. Explorer Verification
- Screenshot from https://explorer.preview.midnight.network/
- Showing contract address: `0x0200f15cc7c3900333c9fa3efaa9cc306b2bdcb7bf83b5119e32c8944d87`
- Showing at least 1 transaction

### 10. Error Handling
- Screenshot of wallet connection error (when 1AM Wallet is not installed)
- Error message displayed cleanly, not a raw console error

---

## Optional Screenshots
- Sentry dashboard showing captured events
- Plausible analytics dashboard
- Multiple user wallet addresses interacting with the contract on explorer
- Unit test output (`npm test` passing)
- Production build output (`npm run frontend:build` success)

## File Naming Convention
```
screenshots/
├── 01_landing_desktop.png
├── 02_onboarding_step1.png
├── 03_onboarding_final.png
├── 04_wallet_connected.png
├── 05_lottery_main.png
├── 06_zk_proof_overlay.png
├── 07_ticket_confirmed.png
├── 08_feedback_widget.png
├── 09_mobile_view.png
├── 10_explorer_verification.png
└── 11_error_handling.png
```
