// src/lib/footer-default.ts
import type { FooterData, StrapiBlock } from '@/types';

const defaultCopyrightBlocks: StrapiBlock[] = [
  {
    type: 'paragraph',
    children: [{ type: 'text', text: '© 2025 Your Company. All rights reserved.' }]
  }
];

export const defaultFooter: FooterData = {
  product_categories: [{ label: 'Products', url: '/products', target: '_self' }],
  right_groups: [
    {
      group_title: 'About',
      links: [
        { label: 'Company', url: '/about', target: '_self' },
        { label: 'Contact', url: '/contact', target: '_self' },
      ]
    }
  ],
  certifications: [],
  footer_links: [
    { label: 'Privacy Policy', url: '/privacy', target: '_self' },
    { label: 'Terms of Service', url: '/terms', target: '_self' },
  ],
  copyright: defaultCopyrightBlocks,
};
