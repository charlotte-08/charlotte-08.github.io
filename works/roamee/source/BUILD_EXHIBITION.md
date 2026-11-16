# ROAMEE 展覽檔案打包

執行：

```powershell
& 'C:\Users\柏瑄\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/build-single-html.mjs
```

輸出檔案為 `dist/ROAMEE-展覽體驗.html`。這個檔案已內嵌 CSS、JavaScript、景點資料、圖片與圖示，可以單獨上傳或下載後直接開啟。

原始專案更新後需重新執行打包腳本，請勿直接修改 `dist` 內的輸出檔。

Google Fonts 在有網路時會載入；沒有網路時會使用裝置的後備中文字體，不影響功能與圖片。

