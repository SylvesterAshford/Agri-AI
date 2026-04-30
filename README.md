# 🌾 AgriShield

**Digital Agronomist for Myanmar's Dry Zone Farmers**

AgriShield is a mobile-first app built with React Native and Expo that delivers climate-smart agricultural intelligence to smallholder farmers in Myanmar's Dry Zone. Scan a QR code with Expo Go and start using it — no build step required.

![Expo](https://img.shields.io/badge/Expo_Go-SDK_54-000020?logo=expo)
![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Platform](https://img.shields.io/badge/Platform-iOS_|_Android_|_Web-green)
![Hackathon](https://img.shields.io/badge/AI_for_Climate--Resilient_Hackathon-2026-00C176?logo=leaflet)
![Organizer](https://img.shields.io/badge/Organized_by-UNDP_%7C_Frontier_Tech_Leaders-0068FF?logo=un)

---

## 🏆 Project Overview

### About the Hackathon

AgriShield was built for the **AI for Climate-Resilient Hackathon 2026**, organized by **Frontier Tech Leaders** in partnership with **UNDP**, the **SDG AI Lab**, and **ICPSD** — held across **Yangon & Mandalay on 28 March 2026**.

The hackathon challenged multidisciplinary teams to co-create practical, scalable, and locally relevant AI solutions that empower farmers and agri-related small businesses in Myanmar to become more productive, climate-resilient, and digitally included.

---

### 📋 Problem Statement

![AI for Climate-Resilient Hackathon 2026 — Problem Statement](./Project_pic.png)

> *"Farmers and agri-related small businesses in Myanmar continue to face daily operational challenges that directly affect their productivity and income. These include unpredictable weather patterns, fluctuating market prices, limited access to reliable advisory services, and lack of timely, data-driven insights. Most decision-making remains reactive rather than informed by predictive or analytical tools.*
>
> *While digital technologies and AI have the potential to address many of these challenges, existing solutions are often inaccessible, not user-centric, or not designed for low-connectivity rural environments. In addition, limited attention to data privacy and responsible AI practices can create risks for users and reduce trust in digital systems.*
>
> *There is a need to develop practical, scalable, and locally relevant solutions that combine technology with real user needs. Encouraging multidisciplinary teams to co-create such solutions can help bridge this gap and accelerate the development of inclusive and climate-resilient agri-tech innovations."*
>
> — **Frontier Tech Leaders / UNDP, AI for Climate-Resilient Hackathon 2026**

---

### 💡 Our Solution

AgriShield directly addresses every dimension of the problem statement:

| Challenge | AgriShield's Response |
|---|---|
| 🌦️ **Unpredictable weather patterns** | 14-day AI-powered flood, drought & pest risk forecasts with action plans |
| 📈 **Fluctuating market prices** | Real-time multi-city price comparison, 10-day forecasts & breakeven calculator |
| 📡 **Limited advisory access** | Peer-to-expert Q&A feed with AI answer verification & pest ID via camera |
| 📊 **Reactive decision-making** | Predictive risk scores & data-driven alerts pushed proactively to farmers |
| 🌐 **Low-connectivity rural environments** | Offline-first architecture; works on entry-level Android devices with minimal data |
| 🔒 **Data privacy & responsible AI** | On-device processing where possible; transparent AI confidence scores shown to users |
| 🗣️ **Inaccessible / non-user-centric UX** | Fully localized in **Burmese (Myanmar Unicode)**; designed with and for smallholder farmers |

AgriShield is not a generic agricultural app — it is purpose-built for Myanmar's Dry Zone context, grounded in real farmer needs, and designed to be trusted, usable, and impactful from day one.

---

## ✨ Features

| Tab | What It Does |
|---|---|
| 🏠 **Home** | Personalized dashboard with weather risk, market prices, community activity, and pest ID quick-access |
| 🌦️ **Climate Shield** | 14-day flood / drought / pest risk forecast with step-by-step action plans |
| 📈 **Market Lens** | Multi-city price comparison, 10-day price forecast, breakeven calculator |
| 🧠 **Knowledge Feed** | Peer-to-expert Q&A with AI verification, pest ID via camera, community alerts |
| 👤 **Profile** | Farm details, AI accuracy stats, notification preferences, language toggle |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **Expo Go** app on your phone ([App Store](https://apps.apple.com/app/expo-go/id982107779) / [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent))

### 1. Install Dependencies

```bash
cd agrishield
npm install
```

### 2. Start the Dev Server

```bash
npm start
```

### 3. Open on Your Phone

Scan the QR code in the terminal with:
- **Android** → Expo Go app
- **iOS** → Camera app

That's it. The app loads on your phone instantly.

### Platform-Specific Commands

```bash
npm run ios        # iOS Simulator (requires Xcode)
npm run android    # Android Emulator (requires Android Studio)
npm run web        # Web browser
```

---

## 📁 Project Structure

```
agrishield/
├── app/                        # Screens (file-based routing)
│   ├── _layout.tsx             # Root layout (providers, fonts)
│   ├── +not-found.tsx          # 404 screen
│   └── (tabs)/                 # Tab navigation group
│       ├── _layout.tsx         # Tab bar config (Feather icons, blur)
│       ├── index.tsx           # Home / Dashboard
│       ├── climate.tsx         # Climate Risk Monitor
│       ├── market.tsx          # Market Price Comparison
│       ├── knowledge.tsx       # Knowledge Feed + Pest ID
│       └── profile.tsx         # User Profile & Settings
├── components/                 # Shared UI components
│   ├── ActionCard.tsx          # Step-by-step action cards
│   ├── ErrorBoundary.tsx       # Error boundary wrapper
│   ├── ErrorFallback.tsx       # Error fallback UI
│   ├── FeedCard.tsx            # Knowledge feed post cards
│   ├── KeyboardAwareScrollViewCompat.tsx
│   └── RiskBar.tsx             # Risk score display bar
├── constants/
│   └── colors.ts               # Design system color tokens
├── assets/images/              # App icon & splash screen
├── app.json                    # Expo configuration
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript config
├── babel.config.js             # Babel config
└── metro.config.js             # Metro bundler config
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Expo SDK 54 (Managed Workflow) — Expo Go compatible |
| **UI** | React Native 0.81 |
| **Routing** | Expo Router 6 (file-based) |
| **Language** | TypeScript 5.9 |
| **Fonts** | Inter (via `@expo-google-fonts/inter`) |
| **Icons** | Feather Icons (`@expo/vector-icons`) |
| **State** | React Query (`@tanstack/react-query`) |
| **Animations** | React Native Reanimated 4 + Gesture Handler |
| **Tab Bar** | Blur effect on iOS (`expo-blur`), solid on Android |

---

## 📱 Available Scripts

| Script | Command | Description |
|---|---|---|
| `start` | `npm start` | Start Expo dev server (QR code for Expo Go) |
| `ios` | `npm run ios` | Open in iOS Simulator |
| `android` | `npm run android` | Open in Android Emulator |
| `web` | `npm run web` | Open in web browser |
| `typecheck` | `npm run typecheck` | Run TypeScript type checking |

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| Primary | `#0F6E56` (Deep Teal) | Brand color, buttons, active states |
| Background | `#F5F4F0` (Warm Gray) | Page backgrounds |
| Card | `#FFFFFF` | Card surfaces |
| Border | `#E8E6E0` | Card borders, dividers |
| Red | `#E24B4A` | Danger, high risk |
| Amber | `#EF9F27` | Warning, medium risk |
| Green | `#97C459` | Safe, low risk |
| Blue | `#185FA5` | Market data, info |
| Purple | `#534AB7` | Expert badges, AI |

---

## 🌐 Localization

All UI text is in **Burmese (Myanmar Unicode)**, targeting smallholder farmers in Myanmar's Dry Zone.

---

## 📄 License

Private — All rights reserved.
