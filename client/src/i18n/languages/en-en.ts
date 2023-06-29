// import enLocale from "element-plus/lib/locale/lang/en"

export const lang = {
  nav: {
    grids: "Grids",
    styles: "Styles",
    solutions: "Solutions",
    words: "Words",
    about: "About",
  },
  buttons: {
    changeLanguage: "change language",
    delete: "Delete",
    create: "Create",
    yes: "Yes",
    no: "No",
    exit: "Log out",
    login: "Log in",
    newGrid: "New grid",
    newStyle: "New style",
    print: "Print",
    export: "Export",
    support: "Support MotsFlex",
  },
  suggestions: {
    results: "Results",
  },
  forms: {
    title: "Title",
    options: "Options",
    gridSize: "Grid size",
    comment: "Comment",
    rows: "Rows",
    cols: "Columns",
    name: "Name",
    cellSize: "Cell size",
    borderSize: "Line size",
    borderColor: "Line color",
    outBorderSize: "Border size",
    outBorderColor: "Border color",
    spaceWidth: "Space size",
    definitions: "Definitions",
    arrows: "Arrows",
    size: "Size",
    color: "Color",
    backgroundColor: "Background color",
    format: "Format",
    width: "Width",
    height: "Height",
    margins: "Margins",
    align: 'Alignment',
    pagination: "Pagination",
    left: "Left",
    center: 'Center',
    startIndex: 'First page index',
    top: "Top",
    right: "Right",
    bottom: "Bottom",
    solutionsGrid: "Grilles de Solution",
    gridNum: "Grid Index",
    wordIndex: "Index",
    font: "Font",
    add: "Add",
    addWord: "Add word",
    delete: "Delete",
    deleteWord: "Delete word",
    myWords: "My words",
    grid: "Grid",
    wordLength: "Words Length",
    randomize: "Randomize",
  },
  tooltips: {
    incomplete: "is incomplete",
    nodef: "has no definition",
    noarrow: "has no arrow",
    add: "Add {word} to dictionary",
  },
  alert: {
    wrongpassword: "Wrong password or email",
    passwordsdontmatch: "Passwords don't match",
    passwordtooshort: "Password too short, minimum 6 characters",
  },
  login: {
    title: "Login",
    emal: "Email",
    password: "Password",
    forgotPassword: "Forgot password?",
    login: "Login",
    register: "Register",
    localMode: "Continue without account",
    githubLogin: "Login with Github",
  },
  register: {
    title: "Register",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    send: "Register",
    cancel: "Cancel",
  },
  sentemail: {
    title: "Email sent",
    message: "An email has been sent to {email}. Please follow the instructions in the email to complete the registration process.",
    redirect: 'Go to login page',
  },
  passwordreset: {
    title: "Reset password",
  },
  logout: {
    waiting: "Waiting for logout...",
    success: "Logout successful",
  },
  modes: {
    normal: "Free",
    check: "Check",
    heatmap: "Heatmap",

  },
  home: {
    nav: {
      welcome: "Welcome",
      wcid: "What can it do?",
      gridfilling: "Grid filling up",
      definitionediting: "Definition editing",
      checkmode: "Check mode",
      styling: "Styling",
      printing: "Printing",
      howtouse: "How to use it?",
      account: "Do I need an account?",
      grideditor: "How to use the Editor?",
      resize: "How to resize the grid?",
      customwords: "How to add custom words?",
      suggestions: "How suggestions work?",
      heatmap: "What is the heatmap?",
      languages: "Languages",
      langsupport: "Which languages?",
      langswitch: "How to change language?",
      about: "About",
      why: "Why MotsFlex?",
      who: "Who is behind it?",
      contribute: "How to contribute?",
      support: "Support MotsFlex"
    },
    welcome: {
      title: 'Welcome to MotsFlex!',
      p: 'MotsFlex is an open source tool to help you create and print Crosswords',
    },
    wcid: `MotsFlex is a Crosswords creation tool. It helps you filling up
            the grid with words, and then export it as a PDF file. It can even
            generate words index and solution pages for you.`
    ,
    gridfilling: `MotsFlex has a powefull suggestion engine, which helps you filling
        up the grid without efforts. Everytime you modify the grid, it tries
        to find the words that fit the best into the grid, and proposes them
        to you. You can add your own custom words to the generation engine.`,
    definitionediting: `MotsFlex allows you to edit your definition, and place arrows for
        it`,
    checkmode: `Once you are in check mode, MotsFlex will look for errors in your
        grid: incomplete or unknown words, words without a definition,
        etc.`,
    styling: `You can customize the style of your crossword, by changing the
        colors, fonts, line width etc. Pretty much everything !`,
    printing: `MotsFlex allows you to print your grids as SVG or PDF. It also
        generates a solution page for you, with the grids and the words
        index. You can define styles for the solution page, change the
        layout of the grids, change the font of the words index, etc.`,

    howtouse: ` In this section you will find all you need to understand how
        MotsFlex works and how to use it.`,
    account: `
        No, you don't need an account to use MotsFlex. You can just click
        on
        <em>continue without account</em> and start using it. The only
        difference when you create an account is that your grids get saved
        on the server, so you can access them from any device.
        `,
    grideditor: {
      p: `The editor is the main part of MotsFlex. It has many features and
            shortcuts, which are listed below.`,
      list:
        `<li>
                <b>Turn a cell into definition:</b> Press
                <kbd class="kbc-button">Esc</kbd>. Press again to turn it back
                to a normal cell.
              </li>
              <li>
                <b>Split a definition cell:</b> Jump a line, you will see a
                second button to set arrows. You wont see the split while you
                are focused on the definition cell.
              </li>
              <li>
                <b>Move around in the grid:</b> Press
                <kbd class="kbc-button">&uarr;</kbd>
                <kbd class="kbc-button">&larr;</kbd>
                <kbd class="kbc-button">&rarr;</kbd>
                <kbd class="kbc-button">&darr;</kbd>
                When you are in a definition cell, you can also press
                <kbd class="kbc-button">Ctrl</kbd> +<kbd class="kbc-button"
                  >Enter</kbd
                >
                to move to the next cell.
              </li>
              <li>
                <b>Add a space in a word:</b> Press
                <kbd class="kbc-button">&#124;</kbd> for vertical space, or
                <kbd class="kbc-button">&#95;</kbd> for horizontal space.
              </li>
              <li>
                <b>Switch between suggestion modes:</b> Press
                <kbd class="kbc-button">Space</kbd>.
              </li>
              <li>
                <b>Switch between ordering modes:</b> Press
                <kbd class="kbc-button">&gt;</kbd> or
                <kbd class="kbc-button">&lt;</kbd> .
              </li>
                `,
    },
    resize: {
      p: `Resize can mean many things, here are all the answers to this
            topic.`,
      list: `              <li>
            <b>Add/Remove lines and columns:</b> When you are in the editor,
            click on <b class="icontext">&#9881;</b> in the left panel.
          </li>
          <li>
            <b>Make the cells bigger/smaller:</b> In the Editor, you can
            zoom in/out with the
            <em class="icontext"> + </em>/<em class="icontext">
              -
            </em>
            buttons in the bottom right of the screen.
          </li>
          <li>
            <b>Make the cells bigger/smaller when printing:</b> You will
            need to go to the Styles page, and change the
            <em>Cell size</em> property.
          </li>`
    },
    customwords: `Just got to the <em>Words</em> page, and add your words. You can
        also delete them from there. You cannot modify the base
        dictionnary though. 
        You might need to refresh the page to get thoose words in your suggestions.`,
    suggestions: {
      one: "Theere are two suggestion modes:",
      two: "and",
      three: `
          The first one will
          suggest you words that fit in the grid and try to don't block you
          in the next steps.In this mode, you can sort words by
        <em>score</ em >: The first words in the list will be less likely to
          block you.The second mode just suggest you words that fit in the
          grid.
          `
    },
    heatmap: `
    Everytime you change something in the grid, the heatmap is
    regenerated at the same time as the suggestions for Hammer mode.
    It can take a while when the grid is empty, because there are a
    lot of possibilities, but as you are filling up the grid it
    becomes super fast.<br />
    The heatmap is a representation of the number of words that can
    fit in each cell. The more blue the cell is, the more words can
    fit in it, the more red the cell is, the less words can fit in it.
    It is advisable to fill up first the most red cells.

    `,
    languages: `                  
    For now MotsFlex only supports Français, Español and English. If
    you want to add a new language, please open an issue on
    <a href="https://github.com/Leo-Nicolle/mots-fleches/issues"
      >here</a
    >.`,
    langswitch: {
      one: `Just click on the`,
      two: `icon on the top right of the screen and select the language you want.`
    },
    about: `Mots flex is an Open Source project (MIT licence). You can find
    the code
    <a href="https://github.com/Leo-Nicolle/mots-fleches"> here</a>.`,
    why: `
    It all started with a friend wanting to create crossword puzzles. When I saw her doing it 
    by hand, I started too look on internet for a tool to generate crosswords. I was surprised to see tat 
    there were only paying solutions, or small free tools that would create sparse crosswords or withoout 
    printing features etc. Well there were clearly a lack of tool in that field.
    So I started to create MotsFlex, as a suggestions engine at first. A few months later,
    I injured myself doing woodworking. I was stuck at home with a hand in a cast, and I needed
    to do something. During three weeks I added more features, and published it online. 
    Since, my hand is back to life, and I continue maintaining and making evolve MotsFlex. 
    `,
    who: `
    For now there is only me. But if you want to contribute, you are more than welcome !
    `,
    contribute: `
    You can contribute in many ways:
    <ul>
      <li>
        <b>Code:</b> You can find the code
        <a href="https://github.com/Leo-Nicolle/mots-fleches">here</a>. Follow the instructions in the <em>README</em>
        to install the project locally. Then you can open a pull request with your changes.
      </li>
      <li>
        <b>Report a bug:</b> You can open an issue <a href="https://github.com/Leo-Nicolle/mots-fleches/issues">here</a>.
      </li>
    </ul>
    `,
    support: `
    MotsFlex is free fow now, and the local mode will remain free, but the online accounts might
    end up to cost me money. I host the grids on <a href="https://supabase.com/"> Supabase</a>,
    for now MotsFlex is on the free tier, but if the number of users increase, I will have to pay
    for it. So if you want to support MotsFlex, you can: <a href="https://www.buymeacoffee.com/nicolleleo">Buy me a beer</a>. 
    I will drink it to your health!
    `
  }
};