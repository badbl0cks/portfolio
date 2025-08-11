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

This repo follows a three-branch strategy with some absolutely bonkers automated promotions because manually managing branches is for chumps:

- **`dev`** - Where the magic happens! All new features and fixes go here
- **`staging`** - Integration testing playground, auto-promoted from dev daily at 13:00 UTC via scheduler
- **`main`** - Production branch, gets promoted from staging weekly on Sundays at 14:00 UTC via scheduler

### The Repository Setup

We're running a bit of a funky setup here:
- **Primary repo:** Git origin (configurable - can be self-hosted, GitHub, etc.)
- **GitHub Mirror:** Optional push-only mirror for CI/CD and visibility
- **CI/CD:** GitHub Actions (triggered by pushes or scheduled workflows)

So the workflow is: push to Git origin → (optional mirror to GitHub) → GitHub Actions does the heavy lifting.

### Branch Promotion Dance 💃

**Daily (dev → staging):**
- Robot overlord wakes up at 13:00 UTC every day
- Checks if dev has new commits (because we're not animals)  
- Actually validates the build passed via GitHub API (fancy!)
- Fast-forward merge to staging (keeps git history from becoming spaghetti)
- Supports `[skip ci]` in commit messages for when you inevitably break something
- Manual "YOLO deploy anyway" button available

**Weekly (staging → main):**
- Sunday funday at 14:00 UTC for production releases
- Runs semantic-release for proper versioning (we're not completely chaotic)
- Some gnarly branch gymnastics to keep everything synchronized
- SSH-signed commits because we pretend to care about security
- Manual panic button also available

### 🤖 The 5-Workflow CI/CD Circus

Because apparently one workflow wasn't enough, we've got a whole circus of automation:

1. **`build.yml`** - The overachiever that builds everything
   - Gets triggered by basically anything that moves
   - Smart enough to skip builds when we already did the work (lazy efficiency!)
   - Hoards artifacts for 2 days like a digital packrat
   - Has more caching layers than a wedding cake

2. **`deploy.yml`** - The deployment minion (does what it's told)
   - Gets bossed around by the other workflows
   - Juggles blue-green deployments without dropping anything
   - Speaks fluent SSH and WireGuard
   - Downloads artifacts faster than you can say "containerization"

3. **`stage.yml`** - The daily grind automation
   - Wakes up every day to promote dev → staging
   - Actually checks if builds passed (responsible adult behavior)
   - Signs commits with SSH keys because we're fancy like that
   - Has a "force" option for when things go sideways

4. **`release.yml`** - The weekly release party host  
   - Shows up every Sunday with semantic versioning
   - Does some serious git branch yoga to keep everything aligned
   - Maintains that linear history we all pretend to care about

5. **`scheduler-*.yml`** - The workflow orchestrators
   - Exists because GitHub has weird scheduling quirks
   - Makes sure the right code runs from the right branch
   - Basically the puppet masters of this whole operation

## 🚢 Deployment Shenanigans

Pushes to `staging` or `main` branches trigger some absolutely wild blue-green deployment wizardry with more caching than your browser history!

### Blue-Green Magic ✨
1. **Build Phase:** Smart enough to skip rebuilding stuff we already built (because efficiency is sexy)
2. **Deploy Phase:** Download cached goodies and poke the new containers to make sure they're alive
3. **Switch Phase:** HAProxy does the old switcheroo faster than a shell game
4. **Cleanup Phase:** Yeet the old containers into the digital void
5. **Artifact Hoarding:** Keeps build artifacts for 30 days like a digital packrat with commitment issues
6. **Moon Phases:** 🌑 🌒 🌓 🌔 🌝 🌖 🌗 🌘 🌚 (for spiritual alignment)

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
