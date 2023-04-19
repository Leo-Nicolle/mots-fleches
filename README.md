# Mots Fléchés - Crosswords

Generateur de mots fléchés. Crosswords generator. Generator de Crucigramas.

# [Documentation](https://leo-nicolle.github.io/mots-fleches/)
 - [Français]()
 - [Español]()
 - [English]()

## Installation

### Windows/Mac

Sous windows et mac il va vous falloir [nodejs](https://nodejs.org/en/download), ensuite, [téléchargez la dernière verion](https://github.com/octo-org/octo-repo/releases/latest), dezipez ouvrez un terminal dans le dossier `mots-flex`: 
```bash
node server.js
```
### Linux
Vous pouvez soit directement lancer le serveur dans un terminal, soit installer le `.deb` [téléchargeable ici](https://github.com/octo-org/octo-repo/releases/latest)

## Fonctionalités

### Suggestions

https://user-images.githubusercontent.com/7451806/226173711-224940ab-17fe-4495-aeca-3f058996eaa8.mp4

 - Mode suggestion simple: (icone eclair). Propose tous les mots qui rentrent
 - Mode suggestion avancé (icone marteau). Ne propse que des mots qui ne bloqueront pas,( si il n'y a pas de mots avec ZZ dans le dictoinnaire, il proposera pas un mot qui une fois dans la grille donnera ZZ) 

### Définitions

https://user-images.githubusercontent.com/7451806/226173722-e1e6e5ba-1f39-4c68-9452-35094e7abe33.mp4

 - Pour créer une case de définition: `echap`
 - Pour séparer une case de définition: sauter deux lignes
 - Ajout de flèches

### Styles

https://user-images.githubusercontent.com/7451806/226175011-0e5de156-70da-4955-9490-dbc411927484.mp4

 - Format du papier (A4, A5, ou tout autre format)
 - Marges
 - Taille des cases
 - Taille/couleur/police des textes

### Export

https://user-images.githubusercontent.com/7451806/232314140-940b8ddf-0f99-47fa-a0ac-4db266715133.mp4

### Multilangues

https://user-images.githubusercontent.com/7451806/233158317-e1bd727d-6dcc-4ea6-8683-e1d800f02a99.mp4


## Contribuer (section en anglais, comme c'est l'usage)

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
