#!/bin/bash

# Firefox Add-on審査用ソースコードZIP作成スクリプト
# 拡張機能のビルドに必要なソースコードと設定ファイルのみを含むZIPファイルを作成します。

set -e

# プロジェクトのルートディレクトリに移動
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# 出力ファイル名
OUTPUT_FILE="source_code.zip"

# 既存のZIPファイルを削除
if [ -f "$OUTPUT_FILE" ]; then
    rm "$OUTPUT_FILE"
    echo "既存の $OUTPUT_FILE を削除しました"
fi

echo "ソースコードZIPを作成中..."

# zip作成（拡張機能のビルドに必要なファイルのみ）
zip -r "$OUTPUT_FILE" \
    src/ \
    locales/ \
    assets/ \
    scripts/remove_web_accessible_resources.js \
    package.json \
    package-lock.json \
    tsconfig.json \
    tailwind.config.js \
    postcss.config.js \
    vite.config.ts \
    BUILD_INSTRUCTIONS.md \
    LICENSE \
    -x "*.DS_Store" \
    -x "*/__tests__/*" \
    -x "*.test.ts" \
    -x "*.test.tsx" \
    -x "*.stories.ts" \
    -x "*.stories.tsx"

# ZIPファイルのサイズを表示
ZIP_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
ZIP_SIZE_BYTES=$(ls -l "$OUTPUT_FILE" | awk '{print $5}')

echo ""
echo "✅ $OUTPUT_FILE を作成しました"
echo "📦 ファイルサイズ: $ZIP_SIZE"

# 200MB (209715200 bytes) チェック
MAX_SIZE=209715200
if [ "$ZIP_SIZE_BYTES" -gt "$MAX_SIZE" ]; then
    echo "⚠️  警告: ファイルサイズが200MBを超えています！"
    exit 1
else
    echo "✅ ファイルサイズは200MB以内です"
fi

echo ""
echo "ZIPファイルの内容:"
unzip -l "$OUTPUT_FILE" | tail -1
