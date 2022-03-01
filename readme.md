# Advanced Computer Graphics: Walking Down the Street

## Setup and Running

The project uses Webpack with TypeScript, meaning it needs to be built before being accessed.

Firstly, ensure Node.js is installed (this was tested using node v16.13.2 and npm 8.4.0).

Next, install the dependencies by running `npm install` in the project's root directory.

To build and host the application on a development webpack server, run `npm run dev`.

Otherwise, to build the project, run `npm run build` to make a production build, or `npm run build-dev` for a dev build, host the produced folder to access the application.

Once on the web application (`http://localhost:8080` if using the webpack dev server), click the screen and use WASD to move (shift to go quickly) and the mouse (or arrow keys) to look.

Depending on the LOD count specified in `/src/app/worldobject/City.ts`, the client may take a while to load, during which, progress information is shown in the console.

## External Resources

All assets in `/assets/` except for the models in `/assets/custom/` are from free model / texture / animation websites (such as TurboSquid, Sketchfab, Free3D, CGTrader, freestocktextures, freepik), their attributions are included in the respective folders.

The control objects in `/src/ts/app/controls/` are TypeScript adaptations of the respective objects provided in the Three.js examples (to add features such as sensitivity controls, making them more suitable for this project).
The `.js` and `.d.ts` objects in `/src/ts/app/utils/` are modified versions of the Three.js and @types/three.js libraries to fix bugs and make them compatible with Webpack and TypeScript.
All other code is custom-made for the project.
The `/src/ts/app/assets/` and `/src/ts/app/assets/worldobject/` folders contain the custom code for asset loading and scene construction.
