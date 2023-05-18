# Developement

In this section you will find (I hope) everything you need to understand how the project works and how to contribute. 


## General Architecture

There are 3 folders: 
 - server: Responssible for data storage (grids, dictionnary, options) and search
 - client: Responssible for user input, UI
 - grid: Code for common things between client and server, holds types and some helper classes.

## Server
The server is an `express` app with a few tests, it could use some more validation on `CRUD` requests. 
### Database

 I used the simplest database I could: `JSON` files. Because there will never be much data, there is no need for any external tool and it is humand readable. It is stored within the paths defined in the `.env` files: 
  - `APP_CROSSWORDS_GRIDS_PATH`: path for the grids.json
  - `APP_CROSSWORDS_OPTIONS_PATH`: path for the options.json
  - `APP_CROSSWORDS_DICO_PATH`: Folder for static dictionnary (user cannot modify it from client)
  - `APP_CROSSWORDS_WORDS_PATH`: path for the csv file containing user's custom words(dumpe there with comma to separate them)

Everytime we make a database operation (create/update/delete), it writes immediatally the changes in the `.json` files. So when user makes a request to the server, the result is saved before sending the response.

### Search
 
  Search algorithm is a bit messy, I want to make it better, see [my messy research on it](https://github.com/Leo-Nicolle/mots-fleches/wiki/Automatic-generation). Ask me directly if you want to improve it and are strugling to understand my mess.

### OptionsController
  I think I'll rename it `Styles` later. I added some new keys to export the solutions, but they are stored within the same file. We'll have new entity soon : `Book` which holds a list of grids, an Option and a SolutionOption. For now the Grids holds an `Option` id but it is ignored in the client for export, so it is useless.


## Client

The client is a `Vue` app, written with `composition` API and `setup` files. It does not have a global state, as it is simple enough for now. 

### Views

There are three main types of view: 
 - The views for printing: they just display `Page` components with the things to print. 
 - The views to edit: they have a `-Editor`, they send post requests to the server, updating the edited entity.
 - The views to create/delete: They show all entities in a Grid Layout with a preview.

### Forms
Usually all the forms are displayed in the left panel, they use `v-model` and send a `@update` event. The component holding them either resends the `@update` event, either send a `post` request to the server

### Renderer
The core of the whole app ! It renders a Grid into SVG. Pretty straightforward, for the future I might add: 
 - simplification of the SVG by using `styles` and `classes` for colors, stroke sizes, fonts etc. It is just not handy with Vue to do that ( when you want to download it and render it into other software)
 - Font embedding ? In the case of downloading the SVG,  it would be nice to embed the fonts as data64

The `GridInput` component is used to type stuff within the grid. It is just a `textarea` placed on top of the SVG. It is not perfect as I had to take in account the scroll. Maybe add a slot within `Grid` and then use relative placement ? 

### Paper components
Thoose are used to render entities for printing. Not sure we really need it as we already have the `views`.

## Testing
 
### server
Just run 

```bash
npm test
```
Tests use `vitest` and the `setup` file to overrite the paths. We could use more tests on search.

### client

You need to start the server in test mode: 
```bash
cd server
npm run e2e:start
```

Then you can run tests on client side:

```bash
cd client
npm run test
```
I wanted to have a script that runs `npm run e2e:reset-db` everytime the client tests restart, but did not do it yet. You'll have to do it by hand.

Tests are run within the browser, was just simpler for me to setup, and it is accurate. There are a lot more to tests, I just did the rendering tests for now.

## Documentation generation

I appologize for how messy is the docs for grid and server: vuepress is not meant to render markdown from `ts-doc`, maybe in the future someone will come up with a tool to generate better markdowns.

