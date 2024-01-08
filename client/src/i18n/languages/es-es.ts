// import enLocale from "element-plus/lib/locale/lang/en"

export const lang = {
    nav: {
        grids: "Cuadrículas",
        styles: "Estilos",
        solutions: "Soluciones",
        words: "Palabras",
        about: "Acerca de",
        fonts: "Fuentes"
    },
    buttons: {
        changeLanguage: "Cambiar idioma",
        delete: "Borrar",
        create: "Crear",
        yes: "Sí",
        no: "No",
        exit: "Cerrar sesión",
        login: "Iniciar sesión",
        newGrid: "Nueva cuadrícula",
        newStyle: "Nuevo estilo",
        print: "Imprimir",
        exportsvg: "Exportar SVG",
        support: "Support MotsFlex",
        cancel: "Cancelar",
        ok: "Ok",
        download: "Descargar",
        uploadGrids: "Subir cuadrículas",
        uploadWords: "Subir palabras",
        dragdrop: "Arrastrar ficheros aquí (o hacer clic)",
        here: "aquí",
    },
    titles: {
        newFont: "Nueva fuente",
    },
    suggestions: {
        results: "Resultados",
    },
    forms: {
        title: "Título",
        options: "Opciones",
        default: 'Por defecto',
        solutions: "Soluciones",
        gridSize: "Tamaño de la cuadrícula",
        comment: "Comentario",
        rows: "Filas",
        cols: "Columnas",
        name: "Nombre",
        cellSize: "Tamaño de las celdas",
        borderSize: "Tamaño de las líneas",
        borderColor: "Color de las líneas",
        outerBorders: "Bordes exteriores",
        borders: "Bordes internos",
        texts: "Textos",
        highlight: "Resaltado",
        splits: "Divisiones",
        spaces: 'Espacios',
        fills: "Rellenos",
        outBorderSize: "Tamaño de los bordes",
        outBorderColor: "Color de los bordes",
        spaceWidth: "Tamaño de los espacios",
        definitions: "Definiciones",
        arrows: "Flechas",
        size: "Tamaño",
        color: "Color",
        backgroundColor: "Color de fondo",
        format: "Formato",
        width: "Ancho",
        height: "Altura",
        margins: "Márgenes",
        margin: "Márgen",
        align: 'Alineación',
        pagination: "Paginación",
        left: "Izquierda",
        center: 'Centro',
        startIndex: 'Índice de la primera página',
        top: "Arriba",
        right: "Derecha",
        bottom: "Abajo",
        solutionsGrid: "Cuadrícula de soluciones",
        gridNum: "Índice de la cuadrícula",
        wordIndex: "Índice",
        font: "Fuente",
        add: "Añadir",
        addWord: "Añadir palabra",
        ban: "Prohibir",
        bannedwords: "Palabras prohibidas",
        banword: "Prohibir palabra",
        delete: "Borrar",
        deleteWord: "Borrar palabra",
        myWords: "Mis palabras",
        grid: "Cuadrícula",
        wordLength: "Longitud de las palabras",
        randomize: "Randomizar",
        fontFamily: "Fuente",
        fontWeight: "Peso",
        offset: "Desplazamiento",
    },
    tooltips: {
        incomplete: "esta incompleto",
        nodef: "no tiene definición",
        noarrow: "no tiene flecha",
        add: "Añadir {word} al diccionario",
    },
    alert: {
        wrongpassword: "Contraseña incorrecta",
        passwordsdontmatch: "Las contraseñas no coinciden",
        passwordtooshort: "La contraseña es demasiado corta. Mínimo 6 caracteres",
        noGrid: "No tienes ninguna cuadrícula, por favor crea una antes de modificar los estilos.",
    },
    login: {
        title: "Iniciar sesión",
        email: "Correo electrónico",
        password: "Contraseña",
        wrongPassword: "Contraseña o Correo incorrecta",
        login: "Iniciar sesión",
        register: "Registrarse",
        forgotPassword: "¿Olvidaste tu contraseña?",
        localMode: "Seguir sin autenticar",
        githubLogin: "Iniciar sesión con GitHub",
    },
    register: {
        title: "Registrarse",
        email: "Correo electrónico",
        password: "Contraseña",
        passwordConfirm: "Confirmar contraseña",
        send: "Enviar",
        cancel: "Cancelar",
    },
    sentemail: {
        title: "Correo enviado",
        message: "Se ha enviado un correo a {email} con las instrucciones para restablecer la contraseña",
        redirect: "Redirigiendo a la página de inicio de sesión...",
    },
    passwordreset: {
        title: "Restablecer contraseña",
    },
    logout: {
        wating: "Esperando a que el servidor se desconecte...",
        success: "Desconexión correcta",
    },
    modes: {
        normal: "Libre",
        check: "Verification",
        heatmap: "Probabilidad",
    },
    home: {
        nav: {
            welcome: "Bienvenido",
            wcid: "¿Qué puede hacer?",
            gridfilling: "Cuadrículas Llenando ",
            definitionediting: "Edición  de Definiciones",
            checkmode: "Modo de Verificación",
            printing: "Impresión",
            styling: "Estilos",
            howtouse: "¿Cómo usar?",
            account: "¿Necesita una cuenta?",
            grideditor: "¿Como usar el editor?",
            resize: "¿Como cambiar el tamaño de la cuadrícula?",
            customwords: "¿Como añadir palabras personalizadas?",
            suggestions: "¿Como usar las sugerencias?",
            heatmap: "¿Que es el modo de probabilidad?",
            languages: "Idiomas",
            langsupport: "¿Qual idiomas son disponibles ?",
            langswitch: "¿Como cambiar el idioma?",
            about: "Acerca de",
            why: "¿Por qué MotsFlex?",
            who: "¿Quién está detrás de MotsFlex?",
            contribute: "¿Cómo contribuir?",
            support: "¿Cómo apoyar el proyecto?",
        },
        welcome: {
            title: 'Bienvenido a MotsFlex!',
            p: 'MotsFlex es una herramienta de código abierto para ayudarte a crear e imprimir crucigramas',
        },
        wcid: `MotsFlex es una herramienta de creación de crucigramas. 
        Te ayuda a llenar la cuadrícula con palabras y luego exportarla como un archivo PDF.
        Incluso puede generar índices de palabras y páginas de soluciones para usted.`,
        gridfilling: `MotsFlex  tiene un potente motor de sugerencias, que te ayuda a llenar
        la cuadrícula sin esfuerzo. Cada vez que modifique la cuadrícula, intenta
        encontrar las palabras que mejor se adapten a la cuadrícula y las propone
        a usted. Puede agregar sus propias palabras personalizadas al motor de generación.`,
        definitionediting: `MotsFlex le permite editar su definición y colocar flechas para ella`,
        checkmode: `Una vez que esté en modo de verificación, MotsFlex buscará errores en su
        cuadrícula: palabras incompletas o desconocidas, palabras sin definición,
        etc.`,
        styling: `Puede personalizar el estilo de su crucigrama, cambiando los colores,
        fuentes, ancho de línea, etc. ¡Casi todo!`,
        printing: `MotsFlex le permite imprimir sus cuadrículas como SVG o PDF. También
        genera una página de solución para usted, con las cuadrículas y el índice
        de palabras. Puede definir estilos para la página de solución, cambiar
        el diseño de las cuadrículas, cambiar la fuente del índice de palabras, etc.`,
        howtouse: `En esta sección encontrarás todo lo que necesitas para entender cómo
        funciona MotsFlex y cómo usarlo.`,
        account: `No, no necesitas una cuenta para usar MotsFlex. Puedes simplemente hacer
        clic en <em>continuar sin cuenta</em> y comenzar a usarlo. La única
        diferencia cuando creas una cuenta es que tus cuadrículas se guardan
        en el servidor, por lo que puedes acceder a ellas desde cualquier dispositivo.`,
        grideditor: {
            p: `El editor es la parte principal de MotsFlex. Tiene muchas funciones y
            atajos, que se enumeran a continuación.`,
            list: `<li>
            <b>Cambiar una celda a definición:</b> Presione
            <kbd class="kbc-button">Esc</kbd>. Presione nuevamente para volver
            a convertirlo en una celda normal.
            </li>
            <li>
            <b>Dividir una celda de definición:</b> Salta una línea, verás un
            segundo botón para establecer flechas. No verás la división mientras
            estés enfocado en la celda de definición.
            </li>
            <li>
            <b>Moverse por la cuadrícula:</b> Presione
            <kbd class="kbc-button">&uarr;</kbd>
            <kbd class="kbc-button">&larr;</kbd>
            <kbd class="kbc-button">&rarr;</kbd>
            <kbd class="kbc-button">&darr;</kbd>
            Cuando esté en una celda de definición, también puede presionar
            <kbd class="kbc-button">Ctrl</kbd> +<kbd class="kbc-button">&#9166;</kbd>
            para pasar a la siguiente celda.
            </li>
            <li>
            <b>Agregar un espacio en una palabra:</b> Presione
            <kbd class="kbc-button">&#124;</kbd> para espacio vertical, o
            <kbd class="kbc-button">&#95;</kbd> para espacio horizontal.
            </li>
            <li>
            <b>Cambiar entre los modos de sugerencia:</b> Presione
            <kbd class="kbc-button">Espacio</kbd>.
            </li>
            <li>
            <b>Cambiar entre los modos de ordenación:</b> Presione
            <kbd class="kbc-button">&gt;</kbd> o
            <kbd class="kbc-button">&lt;</kbd> .
            </li> `
        },
        resize: {
            p: `Cambiar el tamaño de la cuadrícula puede significar muchas cosas, aquí están
            todas las respuestas a este tema.`,
            list: `<li>
            <b>Agregar / eliminar líneas y columnas:</b> Cuando esté en el editor,
            haga clic en <b class="icontext">&#9881;</b> en el panel izquierdo.
            </li>
            <li>
            <b>Hacer las celdas más grandes / más pequeñas:</b> En el Editor, puede
            hacer zoom con los botones
            <em class="icontext"> + </em> / <em class="icontext"> - </em>
            en la parte inferior derecha de la pantalla.
            </li>
            <li>
            <b>Hacer las celdas más grandes / más pequeñas al imprimir:</b> Necesitará
            ir a la página Estilos y cambiar la propiedad <em>Tamaño de celda</em>.
            </li>`
        },
        customwords: `Solo tienes que ir a la página <em>Palabras</em> y agregar tus palabras. Puedes
        también eliminarlos desde allí. No puedes modificar el diccionario base.
        Es posible que deba actualizar la página para obtener esas palabras en sus sugerencias.`,
        suggestions: {
            one: "Hay dos modos de sugerencia:",
            two: "y",
            three: `
            El primero sugerirá palabras que se ajusten a la cuadrícula e intentará no bloquearlo
            en los siguientes pasos. En este modo, puede ordenar las palabras por
            <em>puntuación</em>: las primeras palabras de la lista tendrán menos probabilidades de
            bloquearte. El segundo modo solo sugiere palabras que se ajusten a la
            cuadrícula.
            `
        },
        heatmap: `
        Cada vez que cambias algo en la cuadrícula, el mapa de calor se regenera
        al mismo tiempo que las sugerencias para el modo Hammer. Puede tomar un tiempo cuando
        la cuadrícula está vacía, porque hay muchas posibilidades, pero a medida que
        estás llenando la cuadrícula se vuelve súper rápido.<br />
        El mapa de calor es una representación de la cantidad de palabras que pueden
        caber en cada celda. Cuanto más azul sea la celda, más palabras pueden
        caber en él, cuanto más roja sea la celda, menos palabras pueden caber en él.
        Es aconsejable llenar primero las celdas más rojas.
        `,
        languages: `
        Por ahora, MotsFlex solo admite Français, Español e Inglés. Si
        desea agregar un nuevo idioma, abra un problema en
        <a href="https://github.com/Leo-Nicolle/mots-fleches/issues"
          >aquí</a>.`,
        langswitch: {
            one: `Simplemente haga clic en el`,
            two: `icono en la parte superior derecha de la pantalla y seleccione el idioma que desee.`
        },
        about: `Mots flex es un proyecto de código abierto (licencia MIT). Puedes encontrar
        el código <a href="https://github.com/Leo-Nicolle/mots-fleches"> aquí </a>.`,
        why: `
        Todo comenzó con una amiga que quería crear crucigramas. Cuando la vi haciendo eso
        a mano, comencé a buscar en Internet una herramienta para generar crucigramas. Me sorprendió ver que
        solo había soluciones de pago, o pequeñas herramientas gratuitas que crearían crucigramas dispersos o sin
        funciones de impresión, etc. Bueno, claramente faltaban herramientas en ese campo.
        Así que comencé a crear MotsFlex, como un motor de sugerencias al principio. Unos meses después,
        Me lastimé haciendo carpintería. Estuve atrapado en casa con una mano enyesada, y necesitaba
        hacer algo. Durante tres semanas agregué más funciones y lo publiqué en línea.
        Desde entonces, mi mano ha vuelto a la vida y continúo manteniendo y haciendo evolucionar MotsFlex.
        `,
        who: `Por ahora solo estoy yo. Pero si quieres contribuir, ¡eres más que bienvenido!`,
        contribute: `
        Puedes contribuir de muchas maneras:
        <ul>
            <li>
            <b>Código:</b> Puede encontrar el código
            <a href="https://github.com/Leo-Nicolle/mots-fleches">aquí</a>. Siga las instrucciones en el <em>README</em>
            para instalar el proyecto localmente. Luego puede abrir una solicitud de extracción con sus cambios.
            </li>
            <li>
            <b>Informar un error:</b> Puede abrir un problema <a href="https://github.com/Leo-Nicolle/mots-fleches/issues">
            aquí</a>.
            </li>
        </ul>`,
        support: `
        MotFlex es gratuito por ahora, y el modo local seguirá siendo gratuito, pero las cuentas en línea podrían
        terminan costándome dinero. Alojo las cuadrículas en <a href="https://supabase.com/">Supabase</a>,
        por ahora MotsFlex está en el nivel gratuito, pero si aumenta el número de usuarios, tendré que pagar
        para ello. Entonces, si quieres apoyar a MotsFlex, puedes: 
        <a href="https://www.buymeacoffee.com/nicolleleo">Comprame una cerveza</a>. 
        ¡La beberé por tu salud!
        `
    },
};