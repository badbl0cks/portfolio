# 🚀 Portfolio Bonanza

A sweet little portfolio site with some absolutely ridiculous SMS shenanigans built on Nuxt 4! Looks like things are getting too spicy for the pepper! 🌶️ 

## ✨ The Good Stuff

- 🌙 **Night mode everything** - DaisyUI components that won't burn your eyeballs
- 📱 **SMS contact form** - Because I get wayyyyy too many emails already
- 🎭 **Snazzy animations** - ScrollReveal, Typed.js, and more doing their thang
- 🐳 **Zero-downtime deploys** - Blue-green magic with Docker & HAProxy
- 🔧 **Overengineered infrastructure** - If you didn't spend a week working on a fun but useless feature that will never be used, did you really do any development?

## 🏃‍♂️ Wanna Try It Out?

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

Two-step verification anti-abuse dance: drop your message → prove you're human with SMS → message gets yeeted to my phone via some very questionable infrastructure choices!

Rate-limited because spam just sucks!

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
- **Network:** Hardwired ethernet via attached USB hub (WhyFight with WiFi?)
- **Purpose:** Sits there patiently 24/7 just waiting to send OTPs and forward your messages to my actual phone

The whole contraption lives on my home network and the VPS reaches it through a WireGuard tunnel because apparently I enjoy making simple things complicated just to save $2 a month!

## 🌳 Git Workflow Madness

This repo follows a three-branch strategy with some absolutely bonkers automated promotions because manually managing branches is for chumps:

- **`dev`** - Where the magic happens! All new features and fixes go here
- **`staging`** - Integration testing playground, auto-promoted from dev daily at 04:00 PST via scheduler
- **`main`** - Production branch, gets promoted from staging weekly on Sundays at 05:00 PST via scheduler

### The Repository Setup

It's a bit of a funky setup here:
- **Primary repo:** My Forgejo server (I obviously like self-hosting things)
- **GitHub Mirror:** Forgejo repo configured to push-only mirror to Github for CI/CD and visibility
- **CI/CD:** GitHub Actions (triggered by pushes or scheduled workflows)

So the workflow is: do some coding, commit and push to my Forgejo instance → mirror to GitHub → GitHub Actions does the heavy lifting so my little VPS doesn't have to suffer so much.

### Branch Promotion Dance 💃

**Daily (dev → staging):**
- Wannabe robot overlord wakes up at 04:00 PST every day
- Checks if dev has new commits (because we're not doing all this work for nothing!)
- Actually validates the build passed via GitHub API (fancy!)
- Fast-forward merge to staging (keeps git history from becoming spaghetti)
- Manual "YOLO deploy anyway" button available

**Weekly (staging → main):**
- Sunday funday at 05:00 PST for production releases
- Runs semantic-release for proper versioning (we're not completely chaotic)
- Seduce the GitHub API with a token for build status
- SSH-signed commits because I <3 cryptography
- Manual panic button also available

### 🤖 The 5-Workflow CI/CD Circus

Because apparently one workflow is never enough, I've got a whole collection of automations:

1. **`build.yml`** - The overachiever that builds everything and gets good grades
   - Gets triggered by basically anything that moves
   - Smart enough to skip builds when we already did the work (lazy!)
   - Hoards artifacts for 30 days like a digital packrat
   - Has more caching layers than an onion-flavored wedding cake

2. **`deploy.yml`** - The deployment minion (does what it's told)
   - Gets bossed around by the other workflows
   - Juggles blue-green deployments without dropping anything
   - Speaks fluent SSH and WireGuard
   - Downloads artifacts faster than you can say "docker load"

3. **`stage.yml`** - The daily grind automation
   - Wakes up every day to promote dev → staging
   - Actually checks if builds passed (responsible adult behavior)
   - Signs commits with SSH keys because I'm fancy like that
   - Has a "force" option for when things go sideways

4. **`release.yml`** - The weekly release partayyyy
   - Shows up every Sunday with semantic versioning
   - Does some serious git branch yoga to keep everything aligned
   - Maintains that linear history we all pretend to care about but never look at

5. **`scheduler-*.yml`** - The workflow orchestrators
   - Exists because GitHub has weird scheduling quirks
   - Makes sure the workflow runs from the right branch
   - Basically the puppet masters of this whole operation

## 🚢 Deployment Shenanigans

Pushes to `staging` or `main` branches trigger some absolutely wild blue-green deployment wizardry with more caching than your browser!

### Blue-Green Magic ✨
1. **Build Phase:** Smart enough to skip rebuilding stuff we already built (because efficiency is sexy)
3. **Configure Phase:** Update HAProxy's config, then call it's cell phone and SIG_HUP!
3. **Deploy Phase:** Download cached goodies and poke the new containers to make sure they're alive
4. **Cleanup Phase:** Yeet the old containers into the great /dev/null
5. **Artifact Hoarding:** Keeps old build artifacts much longer than you'd ever need (30 days)
6. **Moon Phases:** 🌑 🌒 🌓 🌔 🌝 🌖 🌗 🌘 🌚

### GitHub Secrets/.env Setup
Deployments generate the needed .env from GitHub secrets, so make sure to slap some secrets up first or copy the .env.example file and edit!

### WireGuard Setup
The stack is rocking the popular [gluetun](https://github.com/qdm12/gluetun) container, so just set up your WIREGUARD_ environment variables with your Github secrets!

## 🔒 Security Fortress

- 🔐 WireGuard tunnel encryption
- 🛡️ Container firewalls and non-root execution
- 🔢 TOTP phone verification + rate limiting
- 🔤 ASCII-only validation (No spammy weird characters please!)

## 🆘 Note to Self: When Things Go Wrong

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

*Built with ❤️ and lots of ☕! (Wow, if you've read this far, and you're hiring, just hire me!)*
