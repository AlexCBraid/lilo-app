# LiLo — Project Tracker
**Live site:** https://lilo-app.vercel.app
**Concierge demo:** https://lilo-app.vercel.app/concierge-demo
**GitHub:** https://github.com/AlexCBraid/lilo-app
**Last updated:** March 24, 2026

---

## Team
| Role | Person | Responsibilities |
|------|--------|-----------------|
| CTO / Product | Alex | Build, tech, infrastructure, product decisions |
| CWO / Commercial | Simon | Venue curation, investor relationships, partnerships, brand |

---

## MVP Definition
Discovery-only. No booking engine. No wearables. No payments.
Core loop: User describes what they need → LiLo recommends from curated database → User books direct with venue.

---

## ✅ Done
- [x] Project folder and GitHub repo created
- [x] Vercel deployment with auto-deploy on push
- [x] Landing page live (green/gold/cream, Playfair Display)
- [x] Waitlist email capture via Formspree
- [x] AI concierge page live at /concierge-demo
- [x] Serverless API proxy (no CORS, no exposed keys)
- [x] Web search enabled — concierge finds real venues
- [x] Markdown rendering in chat (bold, links, separators)
- [x] Venue database created (22 venues across LA, London, Europe)
- [x] Venue database injected into concierge system prompt
- [x] Mock concierge preview on landing page
- [x] Cost controls: 10 message limit, 500 max tokens, 100 req/hr
- [x] Mobile responsive layout
- [x] "22 curated experiences and growing" trust signal
- [x] Frosted glass nav, scroll animations, scroll indicator

---

## 🔄 In Progress
- [ ] Design review with Simon (March 25)
- [ ] Simon to source first 20 additional venue listings

---

## 📋 To Do — Product (Alex)
### High priority
- [ ] Add venue submission form for Simon to add new listings without touching code
- [ ] Add location detection — ask user for location on first load to personalise recommendations
- [ ] Improve concierge formatting — venue cards with thumbnail images
- [ ] Analytics — add simple page view + concierge usage tracking (Plausible or Fathom, privacy-first)
- [ ] Custom domain — purchase lilo.com or getlilo.com or liloapp.com

### Medium priority
- [ ] User accounts — save favourite venues, conversation history
- [ ] Waitlist dashboard — see who signed up, when, from where
- [ ] Email welcome sequence for waitlist signups
- [ ] SEO basics — meta tags, og:image for social sharing
- [ ] "Share this venue" functionality

### Backlog / v2
- [ ] Native iOS app (App Store submission)
- [ ] Booking affiliate links (Mindbody, Momence, FareHarbor)
- [ ] Partner portal — venue self-service listing management
- [ ] Points / rewards system
- [ ] Social features (see who else is going, join sessions)
- [ ] Corporate / B2B tier
- [ ] Wearable data integration (v3 — post legal review)

---

## 📋 To Do — Commercial (Simon)
### High priority
- [ ] Source and write up 20 additional venue listings (format: name, location, category, description, price, best_for, url)
- [ ] Identify 10 target beta testers from network
- [ ] Review landing page and concierge demo — feedback
- [ ] Agree company structure (UK Ltd or US LLC)

### Medium priority
- [ ] Identify 5 potential angel investors from concierge network
- [ ] Outreach to 3 venue partners for early partnerships
- [ ] Define editorial voice and vetting criteria document

### Backlog
- [ ] Investor deck (after beta traction)
- [ ] Press / PR strategy
- [ ] Influencer / ambassador programme

---

## 🚫 Decided Against (and why)
| Feature | Decision | Reason |
|---------|----------|--------|
| Wearable / Apple Health integration | Deferred to v3 | Medical liability risk, App Store complexity |
| In-app booking engine | Deferred to v2 | API complexity, commercial agreements needed |
| Venue scraper | Not building | Undermines curation story, unreliable data |
| Social/Playtomic features | Deferred to v3 | Too complex for MVP |
| Health data recommendations | Never | Medical liability — we are not doctors |

---

## 🗓 Milestones
| Milestone | Target | Status |
|-----------|--------|--------|
| MVP live | March 24, 2026 | ✅ Done |
| First 10 beta users | April 2026 | 🔄 In progress |
| 500 waitlist signups | May 2026 | ⏳ Not started |
| 100 curated venues | June 2026 | ⏳ Not started |
| Seed raise | Q3 2026 | ⏳ Not started |
| iOS app | Q4 2026 | ⏳ Not started |

---

## 💡 Ideas Parking Lot
(Things to discuss — not committed to yet)
- LiLo editorial content — "The 5 best longevity clinics in Europe"
- LiLo Score — a quality rating system for venues (0-100)
- "LiLo Verified" badge for venues that meet full criteria
- Seasonal collections — "Best winter wellness escapes"
- Gift cards / experiences as gifts
