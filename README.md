# Decentralized Lottery

Let participants deposit a fixed amount of tokens into a pool to enter a lottery round. Use a verifiable random function (like Chainlink VRF) to fairly select a winner, and automatically transfer the pooled funds to them.

## Project Vision
Traditional blockchain lotteries broadcast all participant wallet addresses and entry transactions publicly on-chain, creating privacy risks and exposing user token balances to tracking tools. This Decentralized Lottery built on the Midnight Network leverages Compact zero-knowledge smart contracts to allow users to buy lottery tickets and claim prizes with full privacy. On-chain observers can monitor the total pot and draw results, but can never link individual ticket commitments to real-world wallet identities or unrevealed ticket secrets.

## Smart Contract Deployment
- **Network:** Preview
- **Deployed contract ID:** `0x0200325b543c46b160e2802c323d868144e6985589643dc64f791a2fa8c7`
- **Deployer Address:** `mn_preview_12a2217f7f0253b8b621fca5d4d5a21cda10a6f`

## Key Features
- **Privacy-Preserving Ticket Entries:** Participants deposit entry fees into the pool while proving ownership via a ZK witness commitment. Private ticket salts are generated at runtime and never revealed on-chain.
- **Fair Verifiable Random Selection:** Incorporates verifiable seed disclosure to select winning ticket indices objectively.
- **Zero-Knowledge Prize Claims:** Winners submit a ZK proof demonstrating that their ticket witness secret matches the winning commitment without exposing non-winning participant identities.
- **Modern React + Vite Frontend:** Interactive glassmorphic dark interface with live ZK proof generation indicators and automatic Midnight Lace DApp Connector wallet integration.

## Future Scope
- **Multi-Round Automations:** Automated scheduled rollover for unclaimed prize pots across consecutive lottery rounds.
- **Shielded Token Pool Integration:** Direct integration with Midnight shielded tokens for completely untraceable payout transfers.
- **Cross-Chain VRF Oracles:** Direct integration with Chainlink VRF oracles for decentralized cross-chain entropy verification.

## Tech Stack
- **Smart Contract:** Compact (`contracts/lottery.compact`)
- **Frontend Framework:** React 18, Vite 5, TypeScript
- **Wallet Provider:** Midnight DApp Connector API (`window.midnight`)
- **Styling:** Custom Vanilla CSS Design System with Glassmorphic Aesthetics
- **Testing:** Vitest

## Local Development

### Prerequisites
- Node.js >= 20.x
- npm / npx
- Docker Desktop (for optional local devnet stack)

### Step-by-Step Commands

1. **Install Dependencies:**
   ```bash
   npm install
   npm --prefix frontend install
   ```

2. **Run Unit Tests (Circuit Logic, State Transitions & Privacy Isolation):**
   ```bash
   npm test
   ```

3. **Check TypeScript Compilation:**
   ```bash
   npm run compile
   ```

4. **Deploy Smart Contract to Midnight Preview Network:**
   ```bash
   npm run deploy -- --network preview
   ```

5. **Start Frontend Development Server:**
   ```bash
   npm run frontend:dev
   ```

6. **Build Production Frontend Bundle:**
   ```bash
   npm run frontend:build
   ```
