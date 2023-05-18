import { SidebarConfigArray, defineUserConfig } from "vuepress";
import { defaultTheme } from "@vuepress/theme-default";
import { searchPlugin } from "@vuepress/plugin-search";
import { html5Media } from "markdown-it-html5-media";
import fs from "fs/promises";
import { resolve } from "path";

function removeSection(md, title) {
  const reg = new RegExp(`\n(#+ )${title}`);
  const match = md.match(reg)
  if (!match) return md;
  const [m, g] = match;
  const endIndex = match.index + m.length;
  const nextMatch = md.slice(endIndex).match(new RegExp(`\n${g} ?.*\n`))
  // console.log(m, g, match.index)
  // console.log(nextMatch[0], nextMatch.index);
  if (!nextMatch) return md.slice(0, match.index)
  return md.slice(0, match.index).concat(md.slice(endIndex + nextMatch.index));
}


async function tsdocToVuepres(filepath: string) {
  const md = await fs.readFile(filepath, 'utf-8');
  const newMd = removeSection(md, 'Table of contents');
  await fs.writeFile(filepath, newMd);
}

async function walkDir(root: string, transform = false) {
  const trueRoot = resolve('docs', root)
  const list = await fs.readdir(trueRoot);
  const menu: SidebarConfigArray = [];
  for (let i = 0; i < list.length; i++) {
    const file = list[i];
    const path = resolve(trueRoot, file);
    const type = await fs.stat(path);
    if (type.isDirectory()) {
      const recurs = await walkDir(`${root}/${file}`, transform);
      menu.push({
        text: `${file.slice(0, 1).toUpperCase()}${file.slice(1)}`,
        collapsible: true,
        children: recurs
      });

    } else if (type.isFile() && file.endsWith('.md')) {
      if (transform) {
        await tsdocToVuepres(path);
      }
      menu.push(`/${root}/${file}`)
    }
  }
  return menu;

}
try {
  await fs.rm('docs/client/README.md', { recursive: true });
} catch (e) {
  console.log('client readme deleted already');
}
try {
  await fs.rm('docs/server/README.md', { recursive: true });
} catch (e) {
  console.log('server readme deleted already');
}
const clientMenu = await walkDir('client');
const gridMenu = await walkDir('grid', true);
const serverMenu = await walkDir('server', true);
const menu: SidebarConfigArray = [
  "/",
  {
    text: 'Developers',
    collapsible: true,
    children: [
      {
        text: 'Introduction',
        link: '/dev/',
      },
      {
        text: 'Client',
        children: clientMenu,
        collapsible: true
      },
      {
        text: 'Grid',
        children: gridMenu,
        collapsible: true
      },
      {
        text: 'Server',
        children: serverMenu,
        collapsible: true
      }
    ]
  }
]
export default defineUserConfig({
  lang: "en-US",
  title: "Mots-Flex-Docs",
  description: "Documentation for Mots-Flex",
  head: [["link", { rel: "icon", type: "image/x-icon", href: "/icon.svg" }]],
  base: "/mots-fleches/",
  theme: defaultTheme({
    logo: "/mots-fleches/icon.svg",
    sidebar: menu,
    repo: "Leo-Nicolle/mots-fleches",
  }),
  plugins: [
    searchPlugin({}),
    {
      name: "video-md",
      extendsMarkdown: (md) => {
        md.use(html5Media, {
          videoAttrs: 'class="video" controls',
          audioAttrs: 'class="audio" data-collapse',
        });
      },
    },
  ],
  locales: {
    '/': {
      lang: 'en-US',
      title: '',
      description: 'Documentation for Mots-Flex'
    },
    '/fr/': {
      lang: 'Français',
      title: '',
      description: 'Mots-Flex documentation'
    },
    '/es/': {
      lang: 'Español',
      title: '',
      description: 'Mots-Flex documentación'
    }
  }

})

