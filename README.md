# 🚀 Portfolio Bonanza

A spicy little portfolio site with some absolutely ridiculous SMS shenanigans built on Nuxt 4! Looks like things are getting too spicy for the pepper! 🌶️ 

## ✨ The Good Stuff

- 🌙 **Night mode everything** - DaisyUI components that won't burn your eyeballs
- 📱 **SMS contact form** - Because I get wayyy too many emails already 
- 🎭 **Snazzy animations** - ScrollReveal + Typed.js doing their thang
- 🐳 **Zero-downtime deploys** - Blue-green magic with Docker & HAProxy
- 🔧 **Overengineered infrastructure** - We like to do things the hard way over here

## 🏃‍♂️ Getting Started

```bash
# Grab the dependencies
bun install

# Copy example env file and edit
cp .env.example .env && nano .env

# Fire up the dev server
bun run dev

# Build the contraption
bun run build

# Bake it
bun run generate
```

**Current vibe levels:**  
😴 sleepy  
🙂 caffeinated  
🤓 productive  
🔥 on fire  
💀 send halp  

## 📞 Contact Form Wizardry

Two-step verification dance: drop your message → prove you're human with SMS → message gets yeeted to my phone via some questionable infrastructure choices.

Rate-limited because spam just sucksssss! 🛡️

## 🏗️ Infrastructure Tomfoolery

Here's where things get ~completely~ unhinged:

```
🌐 Your Browser → Some VPS → 🔐 WireGuard Tunnel 
→ 🏠 Home Network → 🧟‍♂️ My Frankenstein Phone/SMS-Gateway 
→ 📱 Someone's Legit Regular Phone
```

### The SMS Gateway Setup

I'm running the `android-sms-gateway` app on a completely deranged setup:
- **Hardware:** Pixel 1 with the battery surgically removed (no spicy pillows please)
- **Power:** Permanently plugged into the wall like some kind of cursed landline
- **Network:** Hardwired ethernet via USB-C adapter ("WhyFight" with WiFi?)
- **Purpose:** Sits there 24/7 just waiting to send OTPs and forward your messages to my actual phone

The whole contraption lives on my home network and the VPS reaches it through a WireGuard tunnel because apparently I enjoy making simple things complicated just to save $2 a month!

## 🌳 Git Workflow Madness

This repo follows a three-branch strategy with automated promotions because manually managing branches is for chumps:

- **`dev`** - Where the magic happens! All new features and fixes go here
- **`staging`** - Integration testing playground, auto-promoted from develop daily Monday-Friday at 13:00 UTC/05:00 AM PST
- **`main`** - Production branch, gets promoted from staging weekly on Mondays at 12:00 UTC/04:00 AM PST

### The Repository Setup

We're running a bit of a funky setup here:
- **Primary repo:** Self-hosted Forgejo instance (because it's more fun that way!)
- **Mirror:** GitHub (push-only mirror for CI/CD and visibility)
- **CI/CD:** GitHub Actions (triggered by the mirror's pushes or scheduled)

So the workflow is: push to Forgejo origin → auto-mirrors to GitHub → GitHub Actions does the heavy lifting.

### Branch Promotion Dance 💃

**Daily (develop → staging):**
- Checks if develop has new commits since last staging update
- Validates that the latest build actually passed
- Fast-forward merge to staging (keeps history clean)
- Supports `[skip ci]` in commit messages for any oopsies or boo-boos

**Weekly (staging → main):**
- Runs semantic-release on staging for proper versioning
- Fast-forward merge to main for production release
- Some branch rebasing gymnastics to keep develop up-to-date
- Also supports `[skip ci]`

## 🚢 Deployment Shenanigans

Any (automated) pushes to `staging` or `main` branches to trigger blue-green staging and production deployments! Easy peasy lemon squeezy!

### Blue-Green Magic ✨
1. **Build Phase:** Build new containers and validate
2. **Deploy Phase:** Health check the newbies
3. **Switch Phase:** HAProxy config update and traffic switcheroo
4. **Cleanup Phase:** Nuke old containers from high orbit
5. **Moon Phases:** 🌑 🌒 🌓 🌔 🌝 🌖 🌗 🌘 🌚

### GitHub Secrets Setup
Deployments generate the needed .env from GitHub secrets, so make sure to slap some secrets up first!

### WireGuard Setup
The stack is rocking gluetun, so just set up your WIREGUARD_ environment variables in Github secrets:

## 🔒 Security Fortress

- 🔐 WireGuard tunnel encryption
- 🛡️ Container firewalls and non-root execution
- 🔢 TOTP phone verification + rate limiting
- 🔤 ASCII-only validation (No spammy weird characters please!)

## 🆘 When Things Go Wrong

```bash
# Check if containers are actually alive
docker compose ps && docker compose logs portfolio

# Poke the SMS gateway to see if it's responsive
docker compose exec portfolio curl -f http://your-sms-gateway-ip:9090/health

# Check WireGuard tunnel status
docker compose exec portfolio wg show
```

**Debugging stages of grief:** 😎 confident → 🤔 confused → 😅 nervous → 😰 panicking → 💀 accepting fate → 🍕 ordering pizza

## 📁 What's Where

```
├── app/          # Nuxt 4 frontend
├── server/       # API routes
├── deploy/       # Deployment scripts
└── .github/      # CI/CD workflows
```

## 🤝 Contributing

Feel free to explore the code! This is a personal portfolio, so no contributions are needed, but you can use the architecture and deployment setup for inspiration!

## 📜 License

This project is licensed under **AGPL 3.0 only** - see the [LICENSE](LICENSE) file for details. Any derivative works must also be licensed under AGPL 3.0.

---

*Built with ❤️ and lots of ☕! (Sheesh, if you've read this far, just hire me, please!)*
