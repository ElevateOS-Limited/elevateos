# EduTech - Windows Setup Guide

Follow these steps exactly in order.

---

## STEP 1: Install Required Software

### 1.1 Install Node.js
1. Go to https://nodejs.org
2. Download the **LTS** version (e.g., 20.x)
3. Run the installer, click Next through everything
4. Open Command Prompt and verify: `node --version` (should show v20.x.x)

### 1.2 Install PostgreSQL
1. Go to https://www.postgresql.org/download/windows/
2. Download and run the installer
3. During install:
   - Set password for postgres user (REMEMBER THIS!)
   - Keep default port 5432
   - Keep all defaults, click through
4. After install, open "pgAdmin 4" from Start Menu (optional GUI tool)

---

## STEP 2: Set Up the Database

Open Command Prompt (not PowerShell) and run:

```
psql -U postgres
```

Enter your postgres password when prompted. Then type:

```sql
CREATE DATABASE edutech;
\q
```

---

## STEP 3: Get API Keys

### 3.1 OpenAI API Key (REQUIRED - this powers all AI features)
1. Go to https://platform.openai.com
2. Sign up / Log in
3. Click your profile → API Keys → Create new secret key
4. Copy the key (starts with sk-)
5. Add $5-10 credit at https://platform.openai.com/billing

### 3.2 Google OAuth (for Google sign-in - OPTIONAL)
1. Go to https://console.cloud.google.com
2. Create a new project
3. Go to APIs & Services → Credentials
4. Create OAuth 2.0 Client ID → Web application
5. Add authorized redirect URI: http://localhost:3000/api/auth/callback/google
6. Copy Client ID and Client Secret

### 3.3 Stripe (for payments - OPTIONAL for testing)
1. Go to https://stripe.com and sign up
2. Go to Dashboard → Developers → API keys
3. Copy the test keys (starts with sk_test_ and pk_test_)

---

## STEP 4: Configure Environment Variables

1. In the edutech folder, copy `.env.example` to `.env`:
   - Right-click `.env.example` → Copy → Paste → Rename to `.env`
   
2. Open `.env` in Notepad and fill in your values:

```
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/edutech"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="any-random-long-string-at-least-32-chars"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
OPENAI_API_KEY="sk-your-actual-openai-key"
OPENAI_MODEL="gpt-4o"
STRIPE_SECRET_KEY="sk_test_your-stripe-key"
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-key"
STRIPE_WEBHOOK_SECRET="whsec_placeholder"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

For NEXTAUTH_SECRET, just use any random string like: `mysupersecretkey123456789abcdefghij`

**Minimum required to run**: DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, OPENAI_API_KEY

---

## STEP 5: Install Dependencies

Open Command Prompt, navigate to the edutech folder:

```cmd
cd C:\path\to\edutech
npm install
```

This will take 2-5 minutes.

---

## STEP 6: Set Up Database Tables

```cmd
npx prisma generate
npx prisma db push
```

You should see "✓ Your database is now in sync with your schema."

---

## STEP 7: Start the App

```cmd
npm run dev
```

Wait for: `✓ Ready in X.Xs`

---

## STEP 8: Open in Browser

Go to: **http://localhost:3000**

You should see the EduTech landing page!

---

## Using the App

1. Click "Get Started Free" 
2. Sign up with email and password
3. You'll be taken to the dashboard
4. Complete your profile in Settings
5. Try the Study Assistant - paste some text and click Generate!

---

## Troubleshooting

### "Cannot connect to database"
- Make sure PostgreSQL is running: Open Services (Windows+R → services.msc) → PostgreSQL should be Running
- Check your DATABASE_URL password matches what you set during install

### "OpenAI API error"  
- Check your API key is correct in .env
- Make sure you have billing credit on OpenAI

### "Module not found" errors
- Run `npm install` again
- Delete `node_modules` folder and run `npm install`

### Port 3000 already in use
- Change port: `npm run dev -- -p 3001` then go to http://localhost:3001

### npm not recognized
- Restart Command Prompt after installing Node.js
- Or reinstall Node.js and check "Add to PATH"

---

## What Each Page Does

| Page | URL | Description |
|------|-----|-------------|
| Landing | / | Marketing homepage |
| Sign Up | /auth/signup | Create account |
| Login | /auth/login | Sign in |
| Dashboard | /dashboard | Overview & quick actions |
| Study | /study | AI study notes generator |
| Worksheets | /worksheets | Practice question generator |
| Past Papers | /past-papers | Timed exam simulation |
| Admissions | /admissions | University analysis |
| Internships | /internships | Internship finder |
| Settings | /settings | Your academic profile |
| Pricing | /pricing | Subscription plans |

---

## Notes on API Usage

- All AI features require the OpenAI API key
- Each AI request costs approximately $0.01-0.05 with GPT-4o
- For testing, you can use GPT-3.5-turbo (cheaper): change OPENAI_MODEL="gpt-3.5-turbo" in .env
- Stripe features require valid Stripe keys and configured Price IDs
- Google login requires Google OAuth credentials
