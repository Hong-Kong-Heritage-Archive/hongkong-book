#!/usr/bin/env node

import { runValidation } from "./lib/validation.js"

async function main() {
  const result = await runValidation()

  if (result.warnings.length > 0) {
    console.log("\n[警告] 以下項目建議人工覆核：")
    for (const warning of result.warnings) {
      console.log(`- ${warning.relPath}: ${warning.reason}`)
    }
  }

  if (result.failures.length > 0) {
    console.error("\n[失敗] 驗證未通過：")
    for (const failure of result.failures) {
      console.error(`- ${failure.relPath}: ${failure.reason}`)
    }
    process.exit(1)
  }

  console.log("\n[完成] 所有 schema 與規則驗證通過。")
}

main().catch((error) => {
  console.error("\n[錯誤] 驗證工具執行失敗：", error)
  process.exit(1)
})
