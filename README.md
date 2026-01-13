# TileOut

Tile Out（タイルアウト）は、盤面を列行のスライド操作で動かす戦略ボードゲーム。
列を上へスライドのみ可能なプレイヤーと、行を右へスライドのみ可能なプレイヤーが戦う。
自分のタイルが10個連結すれば勝利。 シンプルだが奥深い、新感覚タイル対戦。

## SEO対策について

このプロジェクトには以下のSEO対策が実装されています：

### メタタグ
- タイトルタグ: 「Tile Out（タイルアウト）- 無料オンライン戦略ボードゲーム」
- メタディスクリプション: ゲームの特徴と魅力を簡潔に説明
- キーワード: ボードゲーム、パズルゲーム、戦略ゲーム等の関連キーワード

### OGP (Open Graph Protocol)
- Facebook、Twitter等のSNSでシェアした際に適切な情報が表示されるよう設定
- OG画像を `/public/og-image.png` に配置してください（推奨サイズ: 1200x630px）

### 構造化データ (JSON-LD)
- Schema.orgのWebApplicationタイプで構造化データを実装
- Google検索結果でリッチスニペットとして表示される可能性があります

### サイトマップとrobots.txt
- `/public/sitemap.xml`: 検索エンジンがページを発見しやすくするためのサイトマップ
- `/public/robots.txt`: クローラーの動作を制御

### デプロイ前の設定変更
以下のURLを実際のドメインに変更してください：
1. `index.html` 内の `https://tileout.example.com/` をすべて実際のURLに変更
2. `sitemap.xml` 内のURLを実際のURLに変更
3. `robots.txt` 内のSitemapのURLを実際のURLに変更
4. OG画像 (`og-image.png`) とスクリーンショット (`screenshot.png`) を `/public/` に配置
