import { defineUserConfig } from "vuepress";
import { defaultTheme } from "@vuepress/theme-default";
import { searchPlugin } from "@vuepress/plugin-search";
import { html5Media } from "markdown-it-html5-media";
export default defineUserConfig({
  lang: "en-US",
  title: "Mots-Flex-Docs",
  description: "Documentation for Mots-Flex",
  head: [["link", { rel: "icon", type: "image/x-icon", href: "/icon.svg" }]],
  base: "/mots-fleches/",
  theme: defaultTheme({
    logo: "/icon.svg",
    sidebar: [
      "/",
    ],
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
        lang: 'en-US', // this will be set as the lang attribute on <html>
        title: '',
        description: 'Documentation for Mots-Flex'
      },
      '/fr/': {
        lang: 'Français',
        title: '',
        description: 'Mots-Flex documentation'
      }
  }

})

