module.exports = {
  title: 'Czj的博客',
  description: '',
  theme: '@vuepress/blog',
  base: '/blog/',
  head: [
    [ 'script', { type: 'text/javascript' }, `
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?24612437a0e31159f0220c5180f93f1c";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
      })();
    ` ]
  ],
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