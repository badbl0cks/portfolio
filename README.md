# 🚀 Personal Portfolio Website

My schnazzy portfolio turbocharged with Nuxt 4 and zero-downtime deployment wizardry! ✨

## ⭐ What's Inside

- 🌙 **Dark UI** with DaisyUI components
- 📱 **SMS Contact Form** with phone verification (because emails are so last millennium)
- 🎨 **Smooth animations** and typing effects
- 🐳 **Zero-downtime deployments** via Docker + HAProxy
- 🔐 **WireGuard tunnel** to home SMS gateway

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Generate static site
bun run generate
```

**Coffee Levels:**  
☕  
☕☕  
☕☕☕  
☕☕☕☕  
🚨🚨🚨🚨🚨  

## 📱 Contact System Flow

A bamboozling two-step form: collect message → verify phone → SMS me directly!
Rate limited to prevent spam-a-geddon. 🚫

## 🏗️ Architecture

```
🌍 Internet → VPS → 🔐 WireGuard → 🏠 Android SMS Gateway
```

Copy `.env.example` to `.env` for configuration.

## 🚢 Deployment Shenanigans

Push to `staging` or `release` branches to trigger blue-green deployments!

### Blue-Green Magic ✨
1. **Build Phase:** Build new containers alongside old ones
2. **Deploy Phase:** Health check the newbies
3. **Switch Phase:** HAProxy traffic switcheroo
4. **Cleanup Phase:** Cleanup old containers
5. **Moon Phases:** 🌑 🌒 🌓 🌔 🌝 🌖 🌗 🌘 🌚

### GitHub Secrets Setup
Set these in your repo for deployment thingamajigs:
- `DEPLOY_KEY`, `DEPLOY_HOST` - SSH access stuff
- SMS gateway credentials and phone number
- `NUXT_SUPER_SECRET_SALT` - for cryptographic tomfoolery

### WireGuard Setup
Copy `wireguard/wg0.conf.template` → `wg0.conf` and fill in your tunnel deets.

## 🔒 Security Fortress

- 🔐 WireGuard tunnel encryption
- 🛡️ Container firewalls and non-root execution
- 🔢 TOTP phone verification + rate limiting
- 🔤 ASCII-only validation (emoji-proof!)

## 🔧 Troubleshooting

```bash
# Check container health
docker-compose ps && docker logs portfolio

# Test SMS connectivity
docker exec portfolio curl -f http://192.168.0.XXX:9090
```

**Debug Panic Levels:** 😎 → 🤔 → 😅 → 😰 → 💀 → 🍕

## 📁 What's Where

```
├── app/          # Nuxt 4 frontend
├── server/       # API routes + SMS gateway libs
├── deploy/       # Deployment scripts
└── .github/      # CI/CD workflows
```

## 🤝 Contributing

Feel free to explore the code! This is a personal portfolio, so no contributions are needed, but you can use the architecture and deployment setup for inspiration!

## 📜 License

This project is licensed under **AGPL 3.0 only** - see the [LICENSE](LICENSE) file for details. Any derivative works must also be licensed under AGPL 3.0.

---

*Built with ❤️ and lots of ☕*
