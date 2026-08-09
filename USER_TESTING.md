# User Testing Protocol

## Goal
Onboard **minimum 10 real users** and collect proof of wallet interactions + feedback.

---

## Step 1: Share the DApp

Share your production URL with 10+ people (classmates, bootcamp peers, Discord/Telegram contacts).

**Message template:**
> 🎰 Hi! I built a **privacy-preserving lottery dApp** on Midnight Network for the SPPU Bootcamp.
> Can you test it for 5 minutes? You'll need the **1AM Wallet** browser extension.
>
> 🔗 Live URL: `<YOUR_PRODUCTION_URL>`
>
> Steps:
> 1. Install 1AM Wallet from https://midnight.network
> 2. Switch to Preview Network
> 3. Get testnet tNIGHT from the faucet
> 4. Connect wallet on my dApp
> 5. Buy a lottery ticket (costs 1 tNIGHT)
> 6. Leave feedback using the purple 💬 button
>
> Thank you! 🙏

---

## Step 2: Collect Wallet Interaction Proofs

For each user, record the following in a spreadsheet or table:

| # | User (initials/alias) | Wallet Address (first 10 chars) | Action Performed | TX Hash (from explorer) | Timestamp |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |
| 4 | | | | | |
| 5 | | | | | |
| 6 | | | | | |
| 7 | | | | | |
| 8 | | | | | |
| 9 | | | | | |
| 10 | | | | | |

**Where to find TX hashes:**
- Open https://explorer.preview.midnight.network/
- Search by the contract address: `0x0200f15cc7c3900333c9fa3efaa9cc306b2bdcb7bf83b5119e32c8944d87`
- Filter transactions by time window

---

## Step 3: Collect Feedback

The FeedbackWidget is built into the app (purple 💬 button, bottom-right). Each user should:
1. Click the feedback button
2. Rate 1–5 stars
3. Select a category
4. Leave an optional comment
5. Submit

**If you have no backend configured**, feedback opens as email. Collect responses manually.

---

## Step 4: Compile Feedback Summary

Create a brief summary document:

```
Total Users Tested: X
Average Rating: X.X / 5.0
Top Feedback Themes:
  1. [Theme] — mentioned by X users
  2. [Theme] — mentioned by X users
  3. [Theme] — mentioned by X users

Notable Quotes:
  - "..." — User X
  - "..." — User Y
```

---

## Step 5: Take Screenshots

For submission evidence, capture:
1. Wallet connection successful (showing address)
2. At least 1 ticket purchase transaction
3. Feedback widget showing a submitted response
4. Explorer showing contract interactions from multiple wallets

See `SCREENSHOT_CHECKLIST.md` for the full list.
