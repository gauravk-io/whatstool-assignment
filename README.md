# Hosted the project
- For your convinence i hosted the assignment on https://whatstools.vercel.app
- Note: As its hosted on free tier backend goes in sleep mode after 15 min of inactivity so please wait for atleast 30 sec for backend to awake after first request / after clicking the link.

# Project setup

### Prerequisites
- Node.js (v16 or higher)

## Clone repository
- git clone https://github.com/gauravk-io/whatstool-assignment.git
- cd whatstool-assignment

## Install dependencies for both client and server
- cd server && npm install
- cd ../client && npm install

## Environment setup
- take reference from .env.example

## Terminal 1: Start backend
- cd server
- npm start

## Terminal 2: Start frontend
- cd client
- npm run dev


# Join logic
- Admin enters the user email
- Backend generates secure random token 
- Paste the invite link in the browser url to accept the invitation after filling name and password.
- User is created in the database with member role and mark the invitation as accepted.