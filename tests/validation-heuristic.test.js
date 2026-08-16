import test from 'node:test'
import assert from 'node:assert/strict'

import { runValidation } from '../tools/lib/validation.js'

test('same-author short titles do not trigger fuzzy duplicate warnings', async () => {
  const result = await runValidation()
  const falsePositives = result.warnings.filter((warning) => {
    const relPath = warning.relPath
    const reason = warning.reason
    return (
      (relPath === 'knowledge/books/fiction/chasing-the-dragon/index.md' ||
        relPath === 'knowledge/books/fiction/destiny-wisely/index.md' ||
        relPath === 'knowledge/books/fiction/the-new-year-wisely/index.md') &&
      /疑似重複（模糊比對）/.test(reason)
    )
  })

  assert.equal(falsePositives.length, 0, `unexpected fuzzy-duplicate warnings: ${JSON.stringify(falsePositives, null, 2)}`)
})
