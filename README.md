# AURAOMEGA – Autonomous Revenue Operating System

> **Replace agencies, media buyers, and content teams with one system that learns and scales revenue autonomously.**

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Lovable Cloud (Supabase)

## Key Features

- **Live Shopify Integration**: Real-time sync with AuraLift Essentials store
- **AI Video Ad Generation**: HeyGen & ElevenLabs powered content creation
- **Social Channels**: TikTok, Pinterest, Instagram, YouTube publishing
- **Omega AI Brain**: 9-agent autonomous optimization system
- **Self-Healing System**: Auto-fixes errors, token expiry, sync issues
- **Revenue Dashboard**: Real-time MRR, ROAS, channel performance

## Integrations Superstack (40+ Tools)

AURAOMEGA connects to your entire business stack:

| Category | Integrations |
|----------|-------------|
| **Project Management** | Asana, ClickUp, monday.com, Trello, Jira |
| **Communication** | Slack, Discord, WhatsApp, Telegram, Gmail, Outlook |
| **CRM & Sales** | HubSpot, Pipedrive, Salesforce, LeadConnector, Facebook Lead Ads |
| **Productivity** | Notion, Google Calendar, Airtable, Todoist, Google Tasks, Microsoft To Do |
| **Forms & Surveys** | Google Forms, Typeform, Jotform |
| **Email & Marketing** | Mailchimp, ActiveCampaign |
| **Storage & Sheets** | Google Drive, Google Sheets, Google Docs, Microsoft Excel |
| **Automation** | Zapier, Calendly, Motion, tl;dv |
| **E-commerce** | Shopify, Webflow |
| **AI** | ChatGPT (OpenAI) |
| **Video** | YouTube |

## Zapier Integration Guide

AURAOMEGA exposes webhook endpoints for Zapier automation:

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/zapier-test` | POST | Test endpoint - returns 200 with status |
| `/zapier-trigger` | POST | Receive events from Zapier |
| `/zapier-action` | POST | Send actions to integrations |

### Security

Add `x-zapier-secret` header with your configured secret for authenticated calls.

### Example Zapier Call

```json
POST https://phpektarjfbgnuyqjnmj.supabase.co/functions/v1/zapier-trigger
Headers: { "Content-Type": "application/json", "x-zapier-secret": "YOUR_SECRET" }
Body: { "action": "new_order", "data": { "order_id": "123" } }
```

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes! Navigate to Project > Settings > Domains and click Connect Domain.

---

> **Note:** Changes made in Lovable auto-sync to this GitHub repo via 2-way integration.
