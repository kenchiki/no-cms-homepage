# 静的HTML生成

サーバーサイドを使用せず、ローカル環境でブログを書いたり、固定ページを書いて、静的HTMLを生成できる。
ライブラリの依存も少なく、10年後も壊れなさそうな構成で作成。

## ビルド

基本的に[VS Codeのタスク定義](.vscode/tasks.json)を使って、下記のビルドを行う。

### 差分ビルド

コンテンツの新規・変更・削除やテンプレートの変更が発生した際、影響のあるページのみ再生成。
削除した記事や固定ページのHTMLも削除。
共通レイアウトを変更した場合は全ページを再生成。

```sh
docker compose run --build --rm -T generator npm run build
```

### フルビルド

強制的に全ページを再生成
`src/`の生成処理を変更した時などに使用。

```sh
docker compose run --build --rm -T generator npm run build:full
```

## コンテンツの追加

### 記事

`articles/YYYY-MM-DD-記事ID.md`を作り、タイトルはMarkdownのH1で書く。
公開日はファイル名から取得。
生成先は`docs/articles/`。
トップページには最新10件、アーカイブには全記事を年別に一覧表示。

### 固定ページ

`pages/`にHTMLを作り、先頭のコメントでページタイトルを指定。
生成先は`docs/pages/`。
自動でリンクされないので、手動でリンクを貼る必要がある。
下記が例。

```html
<!-- title: ギャラリー -->

<h1>ギャラリー</h1>
<p>ここに本文を書く。</p>
```

## CSS・画像などの置き場所

CSSや画像、JavaScriptは`docs/assets/`に置く。
リポジトリ直下の`assets/`は`docs/assets/`へのシンボリックリンク。
編集時に`articles/`や`templates/`のファイルから画像を相対パスで確認する場合は、`../assets/images/gallery.jpg`で同じ画像を参照できる。
