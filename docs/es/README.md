# Mots-flex - Crucigramas

Bienvenido a Mots-Flex, una herramienta Js para crear crucigramas.
*Los videos en esta página muestran cuadrículas en francés, pero el editor también funciona en español.*

## Instalación

### Windows/Mac

En Windows y Mac, necesitará [nodejs](https://nodejs.org/en/download), luego, [descargue la última versión](https://github.com/Leo-Nicolle/mots-fleches/releases/latest), descomprima y abra una terminal en la carpeta `mots-flex`:
```bash
node server.js
```

### Linux

Puede iniciar directamente el servidor en una terminal o instalar `.deb` [descargable aquí] (https://github.com/Leo-Nicolle/mots-fleches/releases/latest)

## Características

### Internacional

![](https://user-images.githubusercontent.com/7451806/233158317-e1bd727d-6dcc-4ea6-8683-e1d800f02a99.mp4)

### Sugerencias

![](https://user-images.githubusercontent.com/7451806/226173711-224940ab-17fe-4495-aeca-3f058996eaa8.mp4)

 - Modo de sugerencia simple: (icono de rayo). Sugiere todas las palabras que encajen
  - Modo de sugerencia avanzado (icono de martillo). Solo sugiere palabras que no bloqueen (si no hay palabras con ZZ en el diccionario, no sugerirá una palabra que una vez en la cuadrícula dé ZZ)

### Definiciones

![](https://user-images.githubusercontent.com/7451806/226173722-e1e6e5ba-1f39-4c68-9452-35094e7abe33.mp4)

 - Para crear un cuadro de definición: `escape`
 - Para separar un cuadro de definición: saltar dos líneas
 - Flechas añadidas

### Estilos

![](https://user-images.githubusercontent.com/7451806/226175011-0e5de156-70da-4955-9490-dbc411927484.mp4)

 - Tamaño del papel (A4, A5 o cualquier otro tamaño)
 - Márgenes
 - Tamaño de caja
 - Tamaño del texto/color/fuente

### Exportar

![](https://user-images.githubusercontent.com/7451806/232314140-940b8ddf-0f99-47fa-a0ac-4db266715133.mp4)


## Cómo usar el editor
Una vez que se inicia la aplicación, comience creando una cuadrícula. Haga clic en él para entrar en el editor:

  - Añadir/Quitar cuadro de definición: <kbd>Esc</kbd>
  - Navegar en la grilla: usa las flechas &uarr; &larr; &rarr; & darr; Si está en una definición, presione <kbd>Ctrl</kbd> + <kbd>Enter</kbd> para salir
  - Cambiar a modo vertical/horizontal: Presione el botón en el panel izquierdo, o <kbd>Ctrl</kbd> + &darr; o <kbd>Ctrl</kbd> + &rarr;
  - Agregar/Eliminar espacio entre palabras: Presione `_` o `-`
  - Dividir un cuadro de definición: insertar dos líneas en blanco:
  - Agregar, Eliminar flechas: mueva el mouse sobre los botones `.` en los bordes de la celda, haga clic en la flecha deseada.
  - Cambiar el tamaño de la cuadrícula: Haga clic en el icono :engranaje: y utilice el formulario. Vuelva a cargar la página si algo está bloqueando.

## Cómo agregar mis propias palabras
Vaya a la página `/words` (palabras en el menú de hamburguesas) y agregue, elimine sus palabras. No puedes modificar el diccionario básico desde esta página, para hacerlo tendrás que modificar los archivos en la carpeta `dico`.

## Cómo agregar otro idioma en las sugerencias

Por defecto, Mots-flex tiene tres diccionarios: francés, español e inglés, si desea crear grillas en otro idioma, necesitará un diccionario: un archivo o un conjunto de archivos que contienen todas las palabras posibles de un idioma, con todas sus variantes (plurales, conjugaciones, etc.), separadas por comas:
```txt
UN,REALMENTE,SIMPLE,DICCIONARIO,UNA,UNOS,UNAS,DICCIONARIOS
```
Luego, tendrás que colocar este/estos archivos en la carpeta `dico` con la extensión `.txt`. Contácteme, estoy interesado en agregar nuevos diccionarios.
## Contribuye (sección en inglés, como es costumbre)

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