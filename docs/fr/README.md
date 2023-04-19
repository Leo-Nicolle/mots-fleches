# Mots-flex

Bienvenue chez Mots-Flex, un outil de génération de mots fléchés.

## Installation

### Windows/Mac

Sous windows et mac il va vous falloir [nodejs](https://nodejs.org/en/download), ensuite, [téléchargez la dernière verion](https://github.com/Leo-Nicolle/mots-fleches/releases/latest), dezipez ouvrez un terminal dans le dossier `mots-flex`: 
```bash
node server.js
```

### Linux
Vous pouvez soit directement lancer le serveur dans un terminal, soit installer le `.deb` [téléchargeable ici](https://github.com/Leo-Nicolle/mots-fleches/releases/latest)


## Fonctionalités
### International

![](https://user-images.githubusercontent.com/7451806/233158317-e1bd727d-6dcc-4ea6-8683-e1d800f02a99.mp4)
### Suggestions

![](https://user-images.githubusercontent.com/7451806/226173711-224940ab-17fe-4495-aeca-3f058996eaa8.mp4)

 - Mode suggestion simple: (icone eclair). Propose tous les mots qui rentrent
 - Mode suggestion avancé (icone marteau). Ne propse que des mots qui ne bloqueront pas,( si il n'y a pas de mots avec ZZ dans le dictoinnaire, il proposera pas un mot qui une fois dans la grille donnera ZZ) 


### Définitions

![](https://user-images.githubusercontent.com/7451806/226173722-e1e6e5ba-1f39-4c68-9452-35094e7abe33.mp4)

 - Pour créer une case de définition: `echap`
 - Pour séparer une case de définition: sauter deux lignes
 - Ajout de flèches

### Styles

![](https://user-images.githubusercontent.com/7451806/226175011-0e5de156-70da-4955-9490-dbc411927484.mp4)

 - Format du papier (A4, A5, ou tout autre format)
 - Marges
 - Taille des cases
 - Taille/couleur/police des textes

### Export

![](https://user-images.githubusercontent.com/7451806/232314140-940b8ddf-0f99-47fa-a0ac-4db266715133.mp4)


## Comment utiliser l'editeur
Une fois que l'appli est lancée, commencez par créer une grille. Cliquez dessus pour entrer dans l'éditeur:

 - Ajouter/Supprimer une case de définition: <kbd>Echap</kbd>
 - Nqviguer dans la grille: utilisez les flêches &uarr; &larr; &rarr; &darr; Si vous êtes dans une définition,appuyez <kbd>Ctrl</kbd> + <kbd>Enter</kbd> pour en sortir
 - Passer en mode vertical/horizontal: Appuyez  sur le button dans le panneau à gauche, ou <kbd>Ctrl</kbd> + &darr; or <kbd>Ctrl</kbd> + &rarr;
 - Ajouter/Supprimer un espace entre les mots: Appuyez sur `_` ou `-`
 - Diviser une case de définition: insérez deux lignes vides:
 - Ajouter, Enlever des flêches: passez la souris sur les bouttons `.` sur les bords de la cellule cliquez sur la flêche désirée.
 - Changer la taille de la grille: Cliques sur l'icone :gear: et utilisez le formulaire. Rechargez la page si quelque chose bloque. 

## Comment ajouter mes propres mots
Allez à la page `/words` (mots dans le burger menu) et ajoutez, supprimez vos mots. Vous ne pouvezpas modifier le dictionnaire de base depuis cette page, pour ce faire, vous derez modifier les fichier dans le dossier `dico`.

## Comment ajouter un autre language dans les suggestiosn

Par defaut, Mots-flex a trois dictionnaires: français, espagnol et anglais, si vous voulez créer des grilles dans une autre langue, il va vous falloir un dictionnaire: un fichier ou un enssemble de fichiers qui contiennent tous les mots possibles d'une langue, avec toutes leur variations (pluriels, conjugaisons etc), separes par des virgules:
```txt
UN,DICTIONNAIRE,VRAIMENT,SIMPLE,UNE,UNS,UNES,DICTIONNAIRES,SIMPLES
```
Ensuite, il faudra placer ce/ces fichiers dans le dossier `dico` avec l'extension `.txt`. Contactez-moi, je suis interressé par l'ajout de nouveaux dictionnaires.

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