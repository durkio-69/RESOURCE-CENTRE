# Youth City Hub - Official Hosting & Launch Guide

Follow this guide to launch your application to the world and ensure your **Database (Firebase)** and **Payments (PesaPal)** work perfectly.

## 1. Firebase (The Database)
To make sure the database works in production:
1. **Enable Authentication Providers:** Go to the [Firebase Console](https://console.firebase.google.com/), select your project -> **Authentication** -> **Sign-in method**.
   - Enable **Google**.
   - Enable **Email/Password**. **If you skip this, standard login/register will fail.**
2. **Authorized Domains:** In the same Authentication tab -> **Settings** -> **Authorized domains** -> Add your new domain (e.g., `your-app.netlify.app` or `your-site.com`). **If you skip this, login will fail.**
3. **Firestore Security Rules:** I have already deployed the rules. If you ever change the database structure, remember to deploy the `firestore.rules` file from the Settings menu.

## 2. Choosing a Hosting Platform
Because this app has a **Search/Chat AI** and **Payment Backend**, you need a host that supports Node.js.

### Option A: Google Cloud Run (Recommended)
This is the easiest way to host this specific app.
- Click the **Deploy** button in the AI Studio header.
- Follow the prompts to connect your Google Cloud account.
- It will automatically handle the server, SSL, and scaling.

### Option B: Netlify (REFACTORED)
You are in luck! I have already refactored the app to work on Netlify using **Netlify Functions**. 

#### Step 1: Connect to Netlify
1. Push this code to a **GitHub repository**.
2. Go to [Netlify](https://app.netlify.com/), click **Add new site** -> **Import an existing project**.
3. Choose GitHub and select your repository.
4. Netlify will automatically detect the settings:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
   - **Functions Folder:** `netlify/functions`

#### Step 2: Add Environment Variables
1. Once the site is created, click the **Site configuration** tab in the top menu.
2. On the left sidebar, click **Environment variables**.
3. Click the **Add a variable** button -> **Add single variable**.
4. Add these one by one from your `.env.example` (copy the names exactly):
   - `GEMINI_API_KEY`
   - `PESAPAL_CONSUMER_KEY`
   - `PESAPAL_CONSUMER_SECRET`
   - `PESAPAL_ENV` (set to `sandbox` for testing or `live` for real money)
   - `PESAPAL_IPN_URL` (e.g., `https://your-site.netlify.app/api/pesapal/ipn`)
   - `PESAPAL_REDIRECT_URL` (e.g., `https://your-site.netlify.app/`)

#### Step 3: Fix Firebase (Crucial for Login)
1. Go to your [Firebase Console](https://console.firebase.google.com/) -> **Authentication** -> **Settings** -> **Authorized domains**.
2. Click **Add domain** and enter your site name (e.g., `youthcity.netlify.app`).
3. Also go to the **Sign-in method** tab and click **Add new provider** -> **Email/Password** -> Enable it and Save.

#### Step 4: Configure PesaPal Dashboard
1. Log in to your [PesaPal Dashboard](https://pay.pesapal.com/dashboard/merchant/login).
2. Go to **Account Settings** -> **IPN Settings**.
3. **Website Domain:** Enter `https://youthcity.netlify.app`
4. **IPN Listener Url:** Enter `https://youthcity.netlify.app/api/pesapal/ipn`
5. Click **SAVE URL**.
6. This allows PesaPal to talk to your website and confirm when a payment is successful.

### Option C: Railway or Heroku
1. Connect your GitHub repository.
2. The platform will read `package.json` and run `npm run build` followed by `npm start`.
3. Add your environment variables in the platform's dashboard.

## 3. PesaPal Final Setup
1. **IPN Registration:** PesaPal needs to know where to send payment updates. 
   - Set `PESAPAL_IPN_URL` to `https://your-site.com/api/pesapal/ipn`
2. **Redirect URL:** 
   - Set `PESAPAL_REDIRECT_URL` to `https://your-site.com/` (The app is programmed to handle the success toast automatically when users land back here).

## 4. Environment Checklist
Ensure these are set in your production console:
- `PESAPAL_CONSUMER_KEY` (Key from PesaPal)
- `PESAPAL_CONSUMER_SECRET` (Secret from PesaPal)
- `PESAPAL_ENV` (Set to `live` for real money, `sandbox` for testing)
- `GEMINI_API_KEY` (Your AI key)

**Your app is now ready for the world!** 🚀
