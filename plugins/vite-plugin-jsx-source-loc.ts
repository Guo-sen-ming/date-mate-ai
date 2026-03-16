import type { Plugin } from 'vite'
import path from 'path'

export default function jsxSourceLoc(): Plugin {
  let root = ''

  return {
    name: 'vite-plugin-jsx-source-loc',
    apply: 'serve',
    enforce: 'pre',
    configResolved(config) {
      root = config.root
    },
    transform(code, id) {
      if (!/\.[jt]sx$/.test(id)) return null
      if (id.includes('node_modules')) return null

      const absPath = path.resolve(root, path.relative(root, id))
      const lines = code.split('\n')
      const result: string[] = []
      let modified = false

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const parts: string[] = []
        let lastIndex = 0

        // Match JSX opening tags: <Component or <div
        // Must be preceded by: start of line, whitespace, (, {, [, =, >, comma, or return/&&/||/?/:
        // Must NOT be inside a generic type like useForm<Type>() or Array<string>
        const regex = /(?:^|[\s({[=>,?:!&|])(<([A-Z][A-Za-z0-9.]*|[a-z][a-z0-9-]*))\b/g
        let match

        while ((match = regex.exec(line)) !== null) {
          const tagStart = match.index + match[0].indexOf('<')
          const tagName = match[2]
          const afterTag = line.slice(tagStart + tagName.length + 1)

          // Skip if this looks like a generic type parameter:
          // - followed by > immediately (e.g., <Type>())
          // - followed by word then > (e.g., <LoginFormData>)
          // - followed by [], |, & which are type syntax
          if (/^\s*[A-Z]/.test(afterTag) === false && /^>?\s*\(/.test(afterTag)) continue
          if (/^[A-Za-z0-9_,\s|&[\]]*>\s*\(/.test(afterTag)) continue

          // Must look like JSX: followed by space+attr, >, />, or newline
          if (!/^(\s+[a-zA-Z{}]|\/?>|\s*$)/.test(afterTag)) continue

          const loc = `${absPath}:${i + 1}:${tagStart + 1}`
          const insertPos = tagStart + tagName.length + 1
          const attr = ` data-source-loc="${loc}"`

          parts.push(line.slice(lastIndex, insertPos))
          parts.push(attr)
          lastIndex = insertPos
          modified = true

          regex.lastIndex += attr.length
        }

        if (parts.length > 0) {
          parts.push(line.slice(lastIndex))
          result.push(parts.join(''))
        } else {
          result.push(line)
        }
      }

      if (!modified) return null
      return { code: result.join('\n'), map: null }
    },
  }
}
