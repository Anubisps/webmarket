import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const defaults = [
    { key: 'site_name', value: 'WindVault Market', label: 'Site Name', category: 'general' },
    { key: 'site_description', value: 'The premier 3rd-party gaming marketplace', label: 'Site Description', category: 'general' },
    { key: 'site_logo', value: '', label: 'Logo URL', category: 'general' },
    { key: 'footer_text', value: '© 2026 WindVault Market. All rights reserved.', label: 'Footer Text', category: 'general' },
    { key: 'facebook_url', value: '', label: 'Facebook URL', category: 'social' },
    { key: 'twitter_url', value: '', label: 'Twitter URL', category: 'social' },
    { key: 'instagram_url', value: '', label: 'Instagram URL', category: 'social' },
    { key: 'maintenance_mode', value: 'false', label: 'Maintenance Mode', category: 'system', type: 'boolean' },
    { key: 'email_sender', value: 'no-reply@windvault.market', label: 'Email Sender', category: 'email' },
    { key: 'smtp_host', value: '', label: 'SMTP Host', category: 'email' },
    { key: 'smtp_port', value: '587', label: 'SMTP Port', category: 'email' },
    { key: 'smtp_username', value: '', label: 'SMTP Username', category: 'email' },
    { key: 'smtp_password', value: '', label: 'SMTP Password', category: 'email' },
    { key: 'enable_2fa', value: 'true', label: 'Enable 2FA', category: 'security', type: 'boolean' },
    { key: 'seo_title', value: 'WindVault Market - 3rd-party gaming marketplace', label: 'SEO Title', category: 'seo' },
    { key: 'seo_description', value: 'Buy and sell gaming products securely', label: 'SEO Description', category: 'seo' },
    { key: 'site_logo', value: '', label: 'Site Logo URL', category: 'general' },  
    { key: 'favicon_url', value: '', label: 'Favicon URL', category: 'general' },
    { key: 'currency', value: 'USD', label: 'Currency', category: 'general' }, 
    { key: 'contact_email', value: 'support@windvault.market', label: 'Contact Email', category: 'general' },
    { key: 'phone_number', value: '', label: 'Phone Number', category: 'general' },
    { key: 'address', value: '', label: 'Address', category: 'general' },
  ]

  for (const s of defaults) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, label: s.label, category: s.category, type: s.type || 'text' },
      create: { key: s.key, value: s.value, label: s.label, category: s.category, type: s.type || 'text' }
    })
  }
  console.log('✅ Site settings seeded.')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
