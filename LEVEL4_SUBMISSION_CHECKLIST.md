# Level 4 Submission Checklist

## 1. Production MVP
- [x] Fully functional production-ready MVP
- [x] Stable frontend (React 18 + Vite 5 + TypeScript)
- [x] Stable smart contract architecture (Compact — 3 ZK circuits)
- [x] Mobile-responsive UI (320px–1920px breakpoints)
- [x] Loading states (ZK proof generation overlay, indexer sync spinner)
- [x] Error handling (Error boundary, mutation rollback, wallet error display)

## 2. User Onboarding
- [ ] Minimum 10 real users onboarded *(requires manual action — see USER_TESTING.md)*
- [ ] Proof of wallet interactions *(collect explorer TX hashes from 10+ users)*
- [x] Basic user feedback collection (floating FeedbackWidget with star rating)

## 3. Product Quality
- [ ] Production deployment *(deploy via Vercel/Netlify — see below)*
- [x] Monitoring integration (Sentry — configure `VITE_SENTRY_DSN`)
- [x] Analytics integration (Plausible — configure `VITE_ANALYTICS_DOMAIN`)
- [x] Optimized user experience (onboarding modal, feedback widget, mobile-responsive)
- [x] Proper project structure (see Architecture section in README)
- [x] Complete documentation (README, this checklist, demo script, screenshots guide)

## 4. Technical Standards
- [x] Smart contract deployed on Midnight Preview testnet
- [x] Contract ID: `0x0200f15cc7c3900333c9fa3efaa9cc306b2bdcb7bf83b5119e32c8944d87`
- [x] Frontend communicates with deployed contract via indexer
- [x] Unit tests pass (`npm test`)
- [x] Build succeeds (`npm run frontend:build`)

## 5. Submission Requirements
- [x] GitHub repository with clean commit history
- [ ] Live production URL *(deploy and paste here)*
- [ ] Demo video (2–5 min walkthrough — see DEMO_SCRIPT.md)
- [ ] 10 user wallet interaction proofs
- [ ] Feedback summary document

---

## Manual Actions Required

### Deploy to Production
```bash
# Option A: Vercel
npx -y vercel --prod --cwd frontend

# Option B: Netlify
npx -y netlify-cli deploy --prod --dir frontend/dist
```

### Enable Analytics
1. Sign up at https://plausible.io
2. Add your domain
3. Uncomment the Plausible script in `frontend/index.html`
4. Set `VITE_ANALYTICS_ENABLED=true` and `VITE_ANALYTICS_DOMAIN=yourdomain.com`

### Enable Monitoring
1. Sign up at https://sentry.io
2. Create a React project
3. Set `VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id`

### Collect 10 User Proofs
See `USER_TESTING.md` for the complete user testing protocol.
