# Polly
## Make polls and share with ease

TLDR:
Polly is a basic web app to allow you to quickly setup polls for any occasion, the polls are easily customisable while setting up and after.

Each poll is given an admin link to view and manage your poll without hastle and comes with poll saving if signed in (optional)

## Features:
- Easy to navigate ui
- Customizable poll themes
- Multi vote prevention
- Poll saving
- Admin managment
- Custom length

## Built with:
- Nextjs
- Shadcn
- Tailwind
- Vercel

## How to run
Running pollify is very simple and can be done with vercel for free or using node.js


### Self Hosting
1. Setup a mongo db, can be done with [mongodb cloud](https://www.mongodb.com/) where you can setup a free M0 cluster
2. Clone project with `git clone https://github.com/cloudyio/pollify`
3. Copy contents of template and create a file named `.env.local`, paste contents into new file
4. Go to the [github oauth dashboard](https://github.com/settings/developers) and create a new app
5. Copy id and place in `AUTH_GITHUB_ID`
6. Create a token and place in `AUTH_GITHUB_SECRET` (oauth secrets can only be seen once and have to be reset if lost)
7. Copy your mongo URI and paste into `MONGO_URI`
8. Open a terminal inside the git folder and run `npx auth secret`, this will generate an oauth secret for auth.js and place it in your env file
9. Run `npm run build` to build your project
10. You can now run `npm run start` which will setup a node server for polly

### Vercel Hosting
1. Setup a mongo db, can be done with [mongodb cloud](https://www.mongodb.com/) where you can setup a free M0 cluster
2. Open any text editor
3. Create a fork of this repository
4. Copy contents of [template](https://raw.githubusercontent.com/cloudyio/pollify/refs/heads/master/template.env) and paste contents into the editor
5. Go to the [github oauth dashboard](https://github.com/settings/developers) and create a new app
6. Copy id and place in `AUTH_GITHUB_ID`
7. Create a token and place in `AUTH_GITHUB_SECRET` (oauth secrets can only be seen once and have to be reset if lost)
8. Copy your mongo URI and paste into `MONGO_URI`
9. Open a terminal inside the git folder and run `npx auth secret`, this will generate an oauth secret for auth.js and place it in your env file
10. Go to vercel and create a new project
11. Click import on the forked project
12. Copy env from text editor and paste into enviromental variables on the dashboard
13. Click deploy

