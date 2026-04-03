export const siteConfig = {
  author: 'Wayne Lion',
  title: 'Test Web',
  subtitle: 'Astro + Strapi + Graphql Website.',
  description: 'A Minimal, SEO-friendly portfolio and blog Astro Website.',
  image: { src: '/hero.jpg', alt: 'Website Main Image' },
  email: 'sample@gmail.com',
  socialLinks: [
    { text: 'GitHub', href: 'https://github.com/kieranwv/astro-theme-vitesse', icon: 'i-simple-icons-github', header: 'i-ri-github-line' },
    { text: 'Twitter', href: '', icon: 'i-simple-icons-x', header: 'i-ri-twitter-x-line' },
    { text: 'Linkedin', href: '', icon: 'i-simple-icons-linkedin' },
    { text: 'Instagram', href: '', icon: 'i-simple-icons-instagram' },
    { text: 'Youtube', href: '', icon: 'i-simple-icons-youtube' },
  ],
  header: { logo: { src: '/favicon.svg', alt: 'Logo Image' }, navLinks: [] },
  // footer 已迁移至 Strapi 管理，不再在此定义
};

export default siteConfig;
