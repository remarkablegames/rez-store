<p align="center">
  <img src="public/logo192.png" alt="Rez Store: Photo Repair">
</p>

# Rez Store: Photo Repair

[![release](https://img.shields.io/github/v/release/remarkablegames/rez-store)](https://github.com/remarkablegames/rez-store/releases)
[![build](https://github.com/remarkablegames/rez-store/actions/workflows/build.yml/badge.svg)](https://github.com/remarkablegames/rez-store/actions/workflows/build.yml)

📸 A casual game about repairing photographs.

Play in your browser:

- [remarkablegames](https://remarkablegames.org/rez-store/)

Or download for desktop:

- [Windows](https://github.com/remarkablegames/rez-store/releases/latest/download/windows.zip)
- [macOS](https://github.com/remarkablegames/rez-store/releases/latest/download/macos.zip)
- [Linux](https://github.com/remarkablegames/rez-store/releases/latest/download/linux.zip)

## Credits

### Images

- [Unsplash](https://unsplash.com/)
  - [A young girl with a big smile and hearts](https://unsplash.com/photos/a-young-girl-with-a-big-smile-and-hearts-nufhUFkjU1o)
  - [Hands reach toward the sky in a field](https://unsplash.com/photos/hands-reach-toward-the-sky-in-a-field-rjOikduibSA)

### Sounds

- [Pixabay](https://pixabay.com/sound-effects/)
  - [scratching](https://pixabay.com/sound-effects/film-special-effects-scratching-85152/)

## Prerequisites

[nvm](https://github.com/nvm-sh/nvm#installing-and-updating):

```sh
brew install nvm
```

## Install

Clone the repository:

```sh
git clone https://github.com/remarkablegames/rez-store.git
cd rez-store
```

Install the dependencies:

```sh
npm install
```

Update the files:

- [ ] `README.md`
- [ ] `index.html`
- [ ] `package.json`
- [ ] `public/*.png`
- [ ] `public/favicon.svg`
- [ ] `public/manifest.webmanifest`
- [ ] `src/main.ts`

## Environment Variables

Update the environment variables:

```sh
cp .env .env.local
```

Update the **Secrets** in the repository **Settings**.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the game in the development mode.

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

The page will reload if you make edits.

You will also see any errors in the console.

### `npm run build`

Builds the game for production to the `dist` folder.

It correctly bundles in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

Your game is ready to be deployed!

### `npm run bundle`

Builds the game and compresses the contents into a ZIP archive in the `dist` folder.

Your game can be uploaded to your server, [itch.io](https://itch.io/), etc.
