import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { zipSync, strToU8 } from 'fflate'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Derive the app's own base URL from the incoming request
  const reqUrl = new URL(req.url)
  const baseUrl = `${reqUrl.protocol}//${reqUrl.host}`

  // Read all extension source files
  const extDir = join(process.cwd(), 'chrome-extension')
  const fileNames = ['manifest.json', 'popup.html', 'popup.css', 'popup.js']

  // Build the zip file map
  const zipEntries: Record<string, Uint8Array> = {}

  for (const name of fileNames) {
    const filePath = join(extDir, name)
    const content = readFileSync(filePath)
    zipEntries[`reading-room-extension/${name}`] = new Uint8Array(content)
  }

  // Generate a pre-configured popup.js with the backend URL already baked in
  // This completely removes the need for the options page
  const originalPopupJs = readFileSync(join(extDir, 'popup.js'), 'utf8')
  const preconfiguredPopupJs = originalPopupJs.replace(
    // Replace the storage lookup with a hardcoded URL
    /const items = await new Promise[\s\S]*?const backendUrl = items\.backendUrl;/,
    `const backendUrl = '${baseUrl}';`
  )
  zipEntries['reading-room-extension/popup.js'] = strToU8(preconfiguredPopupJs)

  // Generate a simplified manifest (no need for storage permission or options page)
  const manifest = JSON.parse(readFileSync(join(extDir, 'manifest.json'), 'utf8'))
  // Remove storage permission and options_ui since URL is now baked in
  manifest.permissions = manifest.permissions.filter((p: string) => p !== 'storage')
  delete manifest.options_ui
  // Restrict host_permissions to just our app's origin for better security
  manifest.host_permissions = [`${baseUrl}/*`]
  zipEntries['reading-room-extension/manifest.json'] = strToU8(JSON.stringify(manifest, null, 2))

  // Zip everything
  const zipped = zipSync(zipEntries, { level: 6 })

  return new NextResponse(zipped, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="reading-room-extension.zip"',
      'Cache-Control': 'no-store',
    },
  })
}
