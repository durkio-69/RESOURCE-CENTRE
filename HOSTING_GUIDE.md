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
1. **Connect GitHub:** Push this code to a GitHub repo and connect it to Netlify.
2. **Settings:** Netlify will automatically detect the settings:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
   - **Functions Folder:** `netlify/functions`
3. **Environment Variables:** Set these in Netlify (Site settings -> Environment variables):
   - `GEMINI_API_KEY`, `PESAPAL_CONSUMER_KEY`, `PESAPAL_CONSUMER_SECRET`, `PESAPAL_ENV`, `PESAPAL_IPN_URL`, `PESAPAL_REDIRECT_URL`.
4. **Login Fix:** Don't forget to add your Netlify URL (e.g., `https://your-app.netlify.app`) to your **Firebase Console -> Authentication -> Authorized domains**.

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
