# Mots Fléchés - Crosswords

Welcome to Mots-Flex, a Js tool to create crosswords.

## Installation 

### Windows/Mac

On windows/Mac you will have to install [nodejs](https://nodejs.org/en), then [download the lastest](https://github.com/Leo-Nicolle/mots-fleches/releases/latest) version of Mots-Flex, unzip it and then run this within a terminal: 
```bash
cd folder/of/mots-flex
node server.js
```

### Linux
On Linux, you can either use the same method as described above, either download the `.deb` package of the last version and do:

```bash
cd Downloads/
sudo dpkg -i mots-flex.deb
```

## Features

### Suggestions

![](https://user-images.githubusercontent.com/7451806/226173711-224940ab-17fe-4495-aeca-3f058996eaa8.mp4)

 - Simple mode: (flashlight icon). Suggests all the words that fits.
 - Advanced mode: (hammer icon). Suggests only words that will not block you on next step: if there is no word with AA in the dicctionary, it will not wussgest a word which once place creates a sequence with AA. 

### Définitions
 - Press `escape` to change a cell into a definition cell.
 - Add an empty line to split a cell
 - Add arrows (right, rightdown, down, downright)

### Styles
 - Paper format (A4, A5, or any custom format)
 - Margins
 - Cell size
 - Size/color/fonts...

### Export
 
![](https://user-images.githubusercontent.com/7451806/232314140-940b8ddf-0f99-47fa-a0ac-4db266715133.mp4)

### How to use the editor

Once you have the app running, start by creating a Grid. Click on it to enter the grid editor. 

 - Make/Delete a definition cell: press <kbd>Escape</kbd>
 - Navigate within the grid: use arrows &uarr; &larr; &rarr; &darr; If you are within a definition cell, press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to leave it
 - Switch between horizontal and vertial mode: Press the button in the left panel, or press <kbd>Ctrl</kbd> + &darr; or <kbd>Ctrl</kbd> + &rarr;
 - Add/Remove a space between words: press `_` or `-`
 - Split a definition cell: insert two new lines
 - Add/Remove arrows: hover the `.` buttons in the cell and click on the appropritate button.
 - Change Grid size: click on the :gear: icon and use the inputs within the modal. Refresh the page if something goes wrong 

## Contribute

Clone the repository (or fork it)
```sh
git@github.com:Leo-Nicolle/mots-fleches.git
```

**install and run server:**
```sh
cd mots-fleches/server
npm i
npm run watch
```
and in annother terminal:
```sh
npm run nodemon
```
**install and run client:**
```sh
cd mots-fleches/client
npm i
npm run dev
```
Make a PR, I would be happy :).
