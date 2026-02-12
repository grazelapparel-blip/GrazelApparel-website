# Quick Troubleshooting Guide

## The Error You're Seeing

```
GET https://gykubwtsohrtbifhahqa.supabase.co/... net::ERR_NAME_NOT_RESOLVED
WebSocket connection to 'wss://gykubwtsohrtbifhahqa.supabase.co/...' failed
```

## What This Means

**Your Supabase database server no longer exists at that address.**

This is NOT:
- ❌ A code error
- ❌ A build issue
- ❌ A network connectivity problem (if happening on multiple systems)
- ❌ A browser cache problem

This IS:
- ✅ Your Supabase project being deleted, suspended, or paused
- ✅ The domain `gykubwtsohrtbifhahqa.supabase.co` no longer pointing to a valid server

---

## Step 1: Verify the Issue

### Check if Supabase project still exists:

```powershell
# In PowerShell, try to ping the Supabase domain
nslookup gykubwtsohrtbifhahqa.supabase.co
```

**If you get an error like "Non-existent domain"** → Your Supabase project is gone.

---

## Step 2: Create a New Supabase Project

### 1. Go to Supabase Dashboard
Visit: https://app.supabase.com

### 2. Sign in / Create account
Use your email and password

### 3. Create New Project
- Click "New Project"
- Name: `grazel-apparel` (or any name)
- Password: Create a strong password
- Region: Choose closest to you
- Click "Create new project"

### 4. Wait for Setup (3-5 minutes)
Your project is being initialized...

### 5. Get Your Credentials

Once project is created:

1. Click on **Project Settings** (gear icon)
2. Go to **API** tab
3. Copy these values:
   ```
   Project URL: https://xxxxx.supabase.co
   Anon public key: (long string starting with eyJ...)
   ```

### 6. Update Your `.env.local` File

Location: `E:\grazel\Grazelapparel-main\.env.local`

Replace with your new credentials:
```dotenv
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-new-anon-key-here
```

---

## Step 3: Set Up Database Tables

### 1. Open Supabase SQL Editor

In your Supabase dashboard:
- Click **SQL Editor** (in left sidebar)
- Click **New Query**

### 2. Copy and Run Schema

From your project:
1. Open: `supabase/schema.sql`
2. Copy **all content**
3. Paste into Supabase SQL Editor
4. Click **Run**

This creates all tables needed for the app.

---

## Step 4: Restart Your App

```powershell
cd E:\grazel\Grazelapparel-main

# Clear node modules cache
npm cache clean --force

# Restart dev server
npm run dev
```

---

## Step 5: Verify It Works

Open your app in browser and check console:

### If Working ✅
```
[Store] Successfully fetched products from Supabase
[Store] Successfully fetched users from Supabase
```

### If Still Not Working ❌
Check console for error type:

| Error Message | What It Means | Fix |
|---|---|---|
| `ERR_NAME_NOT_RESOLVED` | Domain not found | Check URL is spelled correctly |
| `401 Unauthorized` | Wrong API key | Get correct key from Supabase |
| `Network timeout` | Server not responding | Wait a few minutes, try again |
| `Table does not exist` | Schema not imported | Run the schema.sql file |

---

## For Development (No Supabase Needed)

If you just want to develop without Supabase:

1. **App will work fine with mock data**
2. **No setup required**
3. **Products display from hardcoded mock data**
4. **Perfect for UI/UX testing**

Just run:
```powershell
npm run dev
```

The app shows:
- ✅ 8 mock products
- ✅ Full shopping functionality
- ✅ Cart and checkout
- ✅ Admin dashboard (non-functional, uses UI only)

---

## Common Issues

### Issue: "ERR_NAME_NOT_RESOLVED" still appears

**Solution:**
1. Verify your URL is correct (copy-paste from Supabase)
2. Verify your Key is correct (full string, no spaces)
3. Restart dev server: `npm run dev`
4. Hard refresh browser: `Ctrl+Shift+R`

### Issue: "401 Unauthorized"

**Solution:**
1. Double-check your Anon Key (not service role key)
2. Get new key from: Supabase → Settings → API
3. Update `.env.local`
4. Restart dev server

### Issue: "Table does not exist"

**Solution:**
1. Log into Supabase
2. Check **Tables** section (in SQL Editor sidebar)
3. If empty, run: `supabase/schema.sql`

### Issue: Products still don't load

**Solution:**
1. Open browser console (F12)
2. Look for clear error message
3. Check the "What It Means" table above
4. Follow the suggested fix

---

## Getting Help

### Check These Locations for Errors:

1. **Browser Console** (F12 → Console)
   - Most detailed error information
   - Shows exactly why connection failed

2. **Network Tab** (F12 → Network)
   - Shows failed API requests
   - Check response status codes

3. **Application Tab** (F12 → Application)
   - Check if localStorage has correct data
   - Verify session tokens

### Error Message Template

If you need help, provide:
```
System: Windows / Mac / Linux
Network: Stable / Unstable
Supabase URL: https://xxxxx.supabase.co
Console Error: [exact error message from F12]
```

---

## Summary

| Done? | Action |
|---|---|
| ☐ | Check if Supabase project exists (nslookup) |
| ☐ | Create new Supabase project |
| ☐ | Copy new credentials |
| ☐ | Update `.env.local` file |
| ☐ | Run `supabase/schema.sql` in Supabase |
| ☐ | Restart dev server (`npm run dev`) |
| ☐ | Check console for success message |
| ☐ | Test with real data |

Once complete, errors should disappear and app should work fully! ✅

