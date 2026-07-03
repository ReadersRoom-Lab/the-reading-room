import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/sign-in', '/sign-up'],
    },
    sitemap: 'https://the-reading-room-qwsz.vercel.app/sitemap.xml',
  }
}
