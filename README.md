# Waqtaha

**Find the best hour for every activity on your trip.**

Waqtaha is a React web app that turns raw weather numbers into a decision. Pick a destination and an activity, and the app scores every hour of the forecast from 0 to 100, then shows the best times.

- Live demo: https://cpit-405-waqtaha.vercel.app
- Video demo: _add the link here_

## What it does

Weather apps show numbers (temperature, humidity, wind) and leave you to guess. Waqtaha connects the numbers to the activity you want to do, so you get answers like "running is best at 6 AM on Thursday".

### Features

- **Accounts:** registration, login, logout, session handling, and a profile page to edit your name.
- **Protected routes:** pages are available only to logged-in users, and visitors are redirected to the login page. After login, you return to the page you asked for.
- **Destination search:** search a city by name with the Open-Meteo Geocoding API.
- **Hourly scoring:** for Running, Photography, and Beach, every hour gets a score out of 100, shown as a chart and a "Top 3 Times" card.
- **Custom weights:** on the profile page, sliders let each user choose how much each weather factor matters (for example, "I can handle heat but not humidity"). The weights are saved to the user's account and applied to every search.
- **Trip planner:** create trips with dates, add the best time slot of an activity to a trip, and edit or delete plans.
- **Search and filtering:** filter activities by type, filter hours by minimum score, and sort by score or time.
- **Loading and error states** for every API call, and form validation on all forms.
- **Responsive design** for phones and desktops, with a dark theme.

## How the score works

For each weather factor (temperature, humidity, wind, UV, clouds, rain, sun timing), an activity has an ideal range. A trapezoid function gives a result between 0 and 1: it equals 1 inside the ideal range and falls linearly to 0 at the extreme limits.

`hour score = sum of (factor weight x factor result)`

Hard rules cap the score regardless of the other factors: a high chance of rain caps it at 20, and night time gives 0 for daytime activities. Score colors always come with a text label (Excellent, Medium, Poor), so the meaning does not depend on color alone.

## Tech stack

| Area | Technology |
|---|---|
| Frontend | React (Vite) |
| Routing | React Router |
| State | React hooks and Context API |
| Charts | Recharts |
| Authentication and database | Firebase Authentication and Cloud Firestore |
| Weather data | Open-Meteo (Geocoding and Forecast APIs, no API key needed) |
| Styling | Plain CSS (responsive, dark theme) |
| Deployment | Vercel |

## Getting started

### Requirements

- Node.js (LTS version)
- A Firebase project with **Email/Password** authentication and a **Firestore** database

### Installation

```bash
git clone https://github.com/bayanAlharbi0429/CPIT405_waqtaha.git
cd CPIT405_waqtaha
npm install
```

### Environment variables

Create a file named `.env` in the project root (see `.env.example`) and fill in the values from your Firebase project settings:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

The `.env` file is ignored by Git and must never be committed.

### Firestore rules

The security rules are in `firestore.rules`. Paste them into **Firebase Console > Firestore Database > Rules** and publish. They make sure each user can read and write only their own data.

### Run

```bash
npm run dev      # development server at http://localhost:5173
npm run build    # production build
```

## How to use

1. Create an account, then log in.
2. Open **Profile** and set how much each weather factor matters to you for each activity.
3. Open **Explore**, search for a city, and pick an activity.
4. On the results page, see the hourly chart and the top 3 times. Filter by minimum score or sort the hours.
5. Create a trip in **My trips** and add the best time slots to it.

## Project structure

```
src/
  components/   Navbar, Layout, ProtectedRoute, ScoreRing, TiltCard, SunMascot, charts
  context/      AuthContext (session), MoodContext (corner sun)
  firebase/     Firebase configuration
  mocks/        Sample data used during development
  pages/        Home, Login, Register, Dashboard, Explore, Results, Trips, TripDetails, Profile
  services/     Weather API, trips, and profile functions
  utils/        Scoring engine, activities, weight helpers
```

## Team and contributions

CPIT405 group project, King Abdulaziz University.

| Member | Main contributions |
|---|---|
| Arwa Badr | Weather API service, scoring engine, Explore page |
| Taghreed Almalki | Results page and charts, trips (create, edit, delete) |
| Bayan Alharbi | Project setup, authentication and protected routes, design system and layout, profile with custom weights, Firestore rules, deployment, documentation |

Everyone worked on separate feature branches and merged through pull requests, so the commit history and pull requests show each member's work.

## Future work

- Marine activities such as diving, using wave data
- Air quality as an extra scoring factor
- Automatic scheduling of activities across the days of a trip
- Weekly heatmap view of hourly scores
- Custom activities created by users
- Arabic and English interface with RTL support
- Alerts when the forecast changes for a saved trip
