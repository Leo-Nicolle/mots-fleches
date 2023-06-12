// import enLocale from "element-plus/lib/locale/lang/en"

export const lang = {
    nav: {
        grids: "Grilles",
        options: "Options",
        solutions: "Solutions",
        words: "Mots",
        about: "A propos",
    },
    buttons: {
        changeLanguage: "Traduire",
        delete: "Supprimer",
        create: "Créer",
        yes: "Oui",
        no: "Non",
        exit: "Se déconnecter",
        newGrid: "Nouvelle grille",
        newStyle: "Nouveau style",
        print: "Imprimer",
        export: "Exporter",
    },
    suggestions: {
        results: "Résultats",
    },
    forms: {
        title: "Titre",
        options: "Options",
        comment: "Commentaire",
        rows: "Lignes",
        cols: "Colonnes",
        name: "Nom",
        cellSize: "Taille des cellules",
        borderSize: "Taille des lignes",
        borderColor: "Couleur des lignes",
        outBorderSize: "Taille des bordures",
        outBorderColor: "Couleur des bordures",
        spaceWidth: "Taille des espaces",
        definitions: "Définitions",
        arrows: "Flèches",
        size: "Taille",
        color: "Couleur",
        format: "Format",
        width: "Largeur",
        height: "Hauteur",
        margins: "Marges",
        left: "Gauche",
        top: "Haut",
        right: "Droite",
        bottom: "Bas",
        solutions: "Solutions",
        gridNum: "Numéros de grille",
        wordIndex: "Index",
        font: "Police",
        add: "Ajouter",
        addWord: "Ajouter un mot",
        delete: "Supprimer",
        deleteWord: "Supprimer un mot",
        myWords: "Mes mots",
        grid: "Grille",
        wordLength: "Longueur des mots",
        randomize: "Regénérer",
    },
    tooltips: {
        incomplete: "est incomplet",
        nodef: "n'a pas de définition",
        noarrow: "n'a pas de flèche",
        add: "Ajouter {word} au dictionnaire",
    },
    alert: {
        wrongpassword: "Mot de passe ou email incorrect.",
        passwordsdontmatch: "Les mots de passe ne correspondent pas.",
        passwordtooshort: "Le mot de passe est trop court. Minimum 8 caractères.",
    },
    login: {
        title: "Connexion",
        email: "Email",
        password: "Mot de passe",
        forgotPassword: "Mot de passe oublié ?",
        login: "Connexion",
        register: "Inscription",
        localMode: "Continuer sans connexion",
        githubLogin: "Se connecter avec Github",
    },
    register: {
        title: "Inscription",
        email: "Email",
        password: "Mot de passe",
        confirmPassword: "Confirmer le mot de passe",
        send: "Envoyer",
        cancel: "Annuler",
    },
    sentemail: {
        title: "Email envoyé",
        message: "Un email vous a été envoyé à {email}. Veuillez cliquer sur le lien pour confirmer votre adresse email.",
        redirect: "Retour vers la page de connexion.",
    },
    passwordreset: {
        title: "Réinitialisation du mot de passe",
    },
    logout: {
        waiting: "Déconnexion en cours...",
        success: "Déconnexion réussie.",
    },
    modes: {
        normal: "Libre",
        check: "Verification",
        heatmap: "Probabilités",
    },
    home: {
        nav: {
            welcome: "Bienvenue",
            wcid: "A quoi ça sert ?",
            gridfilling: "Remplissage de grille",
            definitionediting: "Edition de définitions",
            checkmode: "Mode vérification",
            styling: "Styles",
            printing: "Impression",
            howtouse: "Manuel d'utilisation",
            account: "Ai-je besoin d'un compte ?",
            grideditor: "Comment utiliser l'éditeur ?",
            resize: "Comment changer la taille de la grille ?",
            customwords: "Comment ajouter mes propres mots ?",
            suggestions: "Comment fonctionnent les suggestions ?",
            heatmap: "Qu'est ce que mode Probabilités ?",
            languages: "Langues",
            langsupport: "Quelles langues sont supportées ?",
            langswitch: "Comment changer la langue ?",
            about: "A propos",
            why: "Pourquoi MotsFlex ?",
            who: "Qui est derrière ?",
            contribute: "Comment contribuer ?",
            support: "Comment me soutenir ?",
        },
        welcome: {
            title: 'Bienvenue dans MotsFlex!',
            p: 'MotsFlex est un outil OpenSource pour générer des grilles de mots croisés.',
        },
        wcid: `MotsFlex est un outil de création de mots croisés.
        Il vous permet de remplir des grilles sans éfforts,
        et ensuite de les exporter en PDF. Il peut même générer l'index des mots
        et les solutions pour vous.`
        ,
        gridfilling: `MotsFlex possède un moteur de suggestions puissant:
        chaque fois que vous modifiez la grille, il essaye de trouver les mots
        qui ont le plus de chance de remplir la grille, et vous les propose. 
        Vous pouvez ajouter vos propres mots au dictionnaire pour que le moteur les prenne en compte.`,
        definitionediting: `MotsFlex vous permet d'éditer les définitions des mots et de placer des flèches.`,
        checkmode: `Lorsque vous êtes en mode vérification, MotsFlex va vous indiquer les erreurs dans votre grille:
        mots incomplets ou inconus du dictionnaire, mots sans définition, mots sans flèche, etc.`,
        styling: `Vous pouvez customiser le style de vos grilles,
        en changeant les couleurs, les polices, l'épaisseur des lignes, etc. 
        A peut près tout en fait!`,
        printing: `MotsFlex vous permet d'exporter vos grilles en SVG ou en PDF. 
        Il peut aussi générer une page de solution pour vous, avec les grilles et l'index des mots.
        Vous pouvez définir le style de la page de solution, changer la disposition des grilles,
        changer la police de l'index des mots, etc.`,
        howtouse: `Dans cette section vous trouverez tout ce dont vous avez besoin pour comprendre
        comment fonctionne MotsFlex et comment l'utiliser.`,
        account: `Non; ous n'avez pas besoin de créer un compte pour utiliser MotsFlex.
        Vous pouvez simplement cliquer sur <em>continuer sans compte</em> et commencer à l'utiliser.
        La seule différence lorsque vous créez un compte est que vos grilles sont sauvegardées sur le serveur,
        et vous pouvez y accéder depuis n'importe quel appareil.`,
        grideditor: {
            p: `L'éditeur est la partie principale de MotsFlex. Il possède de nombreuses fonctionnalités
            et raccourcis, qui sont listés ci-dessous.`,
            list:
                `<li>
                <b>Changer une cellule en définition:</b> Appuyez sur
                <kbd class="kbc-button">Esc</kbd>. Appuyez à nouveau pour revenir
                à une cellule normale.
              </li>
              <li>
                <b>Scinder une cellule de définition:</b> Sauter une ligne, vous
                verrez un second bouton pour placer les flèches. Vous ne verrez
                pas la scission tant que vous êtes dans la cellule de définition.
              </li>
              <li>
                <b>Naviguer dans la grille:</b> Appuyez sur
                <kbd class="kbc-button">&uarr;</kbd>
                <kbd class="kbc-button">&larr;</kbd>
                <kbd class="kbc-button">&rarr;</kbd>
                <kbd class="kbc-button">&darr;</kbd>
                Lorsque vous êtes dans une cellule de définition, vous pouvez aussi appuyer sur
                <kbd class="kbc-button">Ctrl</kbd> +<kbd class="kbc-button"
                  >Enter</kbd
                >
                pour passer à la cellule suivante.
              </li>
              <li>
                <b>Ajouter un espace dans un mot:</b> Appuyez sur
                <kbd class="kbc-button">&#124;</kbd> pour un espace vertical,
                <kbd class="kbc-button">&#95;</kbd> pour un espace horizontal.
              </li>
              <li>
                <b>Changer de mode de suggestion:</b> Appuyez sur
                <kbd class="kbc-button">Espace</kbd>.
              </li>
              <li>
                <b>Changer l'ordre des suggestions:</b> Appuyez sur
                <kbd class="kbc-button">&gt;</kbd> ou
                <kbd class="kbc-button">&lt;</kbd>.
              </li>
                `,
        },
        resize: {
            p: `Changer la taille de la grille peut vouloir dire beaucoup de choses,
            voici toutes les réponses à ce sujet.`,
            list: `<li>
                <b>Ajouter/Supprimer des lignes et des colonnes:</b> Lorsque vous êtes dans l'éditeur,
                cliquez sur <b class="icontext">&#9881;</b> dans le panneau de gauche.
                </li>
                <li>
                <b>Agrandir/Réduire les cellules:</b> Dans l'éditeur, vous pouvez
                zoomer/dézoomer avec les boutons
                <em class="icontext"> + </em>/<em class="icontext">
                    -
                </em>
                en bas à droite de l'écran.
                </li>
                <li>
                <b>Agrandir/Réduire les cellules lors de l'impression:</b> Vous devrez
                aller dans la page de style, et changer la propriété
                <em>Taille des cellules</em>.
                </li>`
        },
        customwords: `Pour ajouter vos propres mots, allez dans la page <em>Mots</em> et ajoutez vos mots.
        Vous pouvez aussi les supprimer de là. Vous ne pouvez pas modifier le dictionnaire de base.
        Vous devrez peut-être rafraîchir la page pour que vos mots apparaissent dans les suggestions.`,
        suggestions: {
            one: "Il y a deux modes de suggestion:",
            two: "et",
            three: `
                Le premier va vous suggérer des mots qui rentrent dans la grille et qui vont essayer de ne pas vous bloquer
                dans les prochaines étapes. Dans ce mode, vous pouvez trier les mots par
                <em>score</ em >: Les premiers mots de la liste seront moins susceptibles de
                vous bloquer. Le deuxième mode vous suggère simplement des mots qui rentrent dans la
                grille.
                `
        },
        heatmap: `
          Chaque fois que vous changez quelque chose dans la grille, la heatmap est
            régénérée en même temps que les suggestions pour le mode Marteau.
            Cela peut prendre un certain temps lorsque la grille est vide, car il y a
            beaucoup de possibilités, mais lorsque vous remplissez la grille, cela
            devient super rapide. <br />
            La heatmap est une représentation du nombre de mots qui peuvent
            rentrer dans chaque cellule. Plus la cellule est bleue, plus il y a de mots qui
            peuvent rentrer dedans, plus la cellule est rouge, moins il y a de mots qui
            peuvent rentrer dedans. Il est conseillé de remplir d'abord les cellules les plus rouges.
          `,
        languages: `
            Pour l'instant MotsFlex ne supporte que le Français, l'Espagnol et l'Anglais. Si
            vous voulez ajouter une nouvelle langue, merci d'ouvrir une issue sur
            <a href="https://github.com/Leo-Nicolle/mots-fleches/issues"
                >ici</a
            >.`,
        langswitch: {
            one: ` Il suffit de cliquer sur l'icône`,
            two: ` en haut à droite de l'écran et de sélectionner la langue que vous
            voulez.`
        },
        about: `Mots flex est un projet Open Source (licence MIT). Vous pouvez trouver le code
            <a href="https://github.com/Leo-Nicolle/mots-fleches"> ici</a>.`,
        why: `
        Tout a commencé avec une amie qui voulait créer des mots fléchés. Quand je l'ai vue le faire
        à la main, j'ai commencé à chercher sur internet un outil pour générer des mots fléchés. 
        J'ai été surpris de voir qu'il n'y avait que des solutions payantes, ou de petits outils gratuits 
        qui créaient des mots fléchés épars ou sans fonction d'impression, etc. Il y avait clairement un manque.
        J'ai donc commencé à créer MotsFlex, comme un moteur de suggestions au début. Quelques mois plus tard,
        je me suis blessé en bricolant. J'étais coincé à la maison avec une main dans le plâtre,
         et j'avais besoin de faire quelque chose. Pendant trois semaines, j'ai ajouté plus de fonctionnalités et 
         je l'ai publié en ligne. Depuis, ma main est revenue à la normale, 
         et je continue à maintenir et à faire évoluer MotsFlex.
        `,
        who: `Pour l'instant il n'y a que moi. Mais si vous voulez contribuer, vous êtes les bienvenus !`,
        contribute: `
        Vous pouvez contribuer de plusieurs façons :
        <ul>
          <li>
            <b>Coder :</b> Vous pouvez trouver le code
            <a href="https://github.com/Leo-Nicolle/mots-fleches">ici</a>. 
            Suivez les instructions dans le <em>README</em> pour installer le projet en local.
            Ensuite vous pouvez ouvrir une pull request avec vos modifications.
          </li>
          <li>
            <b>Signaler un bug :</b> Vous pouvez ouvrir une issue
            <a href="https://github.com/Leo-Nicolle/mots-fleches/issues"> ici </a>.
          </li>
        </ul>
    `,
        support: `
        MotsFlex est gratuit pour l'instant, et le mode local le restera, mais les comptes en ligne pourraient
        finir par me coûter de l'argent. J'héberge les grilles sur <a href="https://supabase.com/"> Supabase</a>,
        pour l'instant MotsFlex est sur le tier gratuit, mais si le nombre d'utilisateurs augmente, je devrai
        payer pour cela. Donc si vous voulez soutenir MotsFlex, vous pouvez : 
        <a href="https://www.buymeacoffee.com/nicolleleo">Me payer une bière</a>. 
        Je la boirai à votre santé !
        `
    }
};