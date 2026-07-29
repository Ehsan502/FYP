# SkillSwap — FYP Edition

## Run
```
npm install
npm run dev
```
Backend: http://localhost:5000 | Frontend: http://localhost:5173

## Configure (server/.env)
- `MONGO_URI` — defaults to local MongoDB on port 27017
- `JWT_SECRET` — change for production
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — required for avatar upload and chat file sharing. Get free credentials at https://cloudinary.com/users/register/free

## Make yourself an admin
```
cd server
npm run seed:admin -- youremail@example.com
```

## Feature list
- Auth (JWT), user profiles (experience, education, portfolio, LinkedIn/GitHub, languages, profile completion %)
- Skill posting, browsing, search & category filters
- Swap requests (send/accept/reject/complete/cancel)
- Real-time chat (Socket.IO): 1-to-1 messaging, online/offline presence, typing indicator, seen receipts, image/file sharing
- Real-time notifications with mark-as-read
- Reviews & star ratings after completed swaps, feeding a trust score
- Admin panel: analytics dashboard, user management (block/unblock/delete), skill moderation, report handling
- Scheduling: weekly availability + session booking with automatic reminders
- Certificates: PDF certificate generation & download for completed swaps
- Gamification: points, badges, levels, leaderboard
- Smart recommendations: matching users by complementary skills, matching skills to learn, learning roadmaps
- Reporting system for users/skills
- Dark/light mode, animations, responsive design, loading skeletons, empty states
