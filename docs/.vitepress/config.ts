import { defineConfig } from "vitepress";

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
  lang: "en-US",

  title: "Lemna",
  titleTemplate: ":title · lemna",

  base: "/lemna/",

  description: "Quickly scaffold and deploy AWS Lambda handlers powered by Typescript",

  markdown: {
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
  },

  srcDir: "content",

  themeConfig: {
    search: {
      provider: "local",
    },

    /*   nav: [
      {
        text: "Discussion",
        link: "https://github.com/marvin-j97/lemna",
      },
    ], */

    sidebar: [
      { text: "Getting started", link: "/" },
      { text: "CLI usage", link: "/cli" },
      {
        text: "Recipes",
        items: [
          { text: "Function URL", link: "/recipes/function-url" },
          { text: "Bundling extra files", link: "/recipes/bundle-files" },
          { text: "IAM policies", link: "/recipes/iam" },
          { text: "Using Prisma", link: "/recipes/prisma" },
          { text: "Using Terraform", link: "/recipes/terraform" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/marvin-j97/lemna" }],
  },
});
