module.exports = {
  title: 'Czj的博客',
  description: '',
  theme: '@vuepress/blog',
  base: '/blog/',
  themeConfig: {
    smoothScroll: true,
    dateFormat: 'YYYY-MM-DD',
    nav: [
      {
        text: 'Blog',
        link: '/',
      },
      {
        text: 'Tags',
        link: '/tag/',
      },
    ],
    footer: {
      contact: [
        {
          type: 'mail',
          link: 'mailto:1205234934@qq.com',
        }
      ],
      copyright: [
        {
          text: 'MIT Licensed | Copyright © 2021',
        }
      ]
    }
  },
}