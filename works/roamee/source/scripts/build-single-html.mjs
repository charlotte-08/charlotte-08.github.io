import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const outputDir=path.join(root,"dist");
const outputFile=path.join(outputDir,"ROAMEE-展覽體驗.html");
const bundleAssetDir=path.join(outputDir,".bundle-assets");
const manifestFile=path.join(outputDir,".bundle-asset-manifest.json");
const moduleOrder=[
  "src/place-taxonomy.js",
  "src/place-schema.js",
  "src/place-batch-01.js",
  "src/place-figma-content.js",
  "src/data.js",
  "src/icons.js",
  "src/components.js",
  "src/app.js"
];

const mimeTypes={".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".gif":"image/gif"};
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const stripModuleSyntax=source=>source
  .replace(/^\s*import\s+.*?;\s*$/gm,"")
  .replace(/^\s*export\s*\{[^}]+\};?\s*$/gm,"")
  .replace(/\bexport\s+(?=(const|let|var|function|class)\b)/g,"");

let javascript=moduleOrder.map(file=>`\n/* ${file} */\n${stripModuleSyntax(read(file))}`).join("\n");
let css=read("styles.css");
const assetPattern=/assets\/[A-Za-z0-9_./-]+\.(?:svg|png|jpe?g|webp|gif)/gi;
const assetPaths=[...new Set([...javascript.matchAll(assetPattern),...css.matchAll(assetPattern)].map(match=>match[0]))];
const embedded=new Map();

fs.mkdirSync(outputDir,{recursive:true});
fs.rmSync(bundleAssetDir,{recursive:true,force:true});
const rasterAssets=assetPaths.filter(relative=>!relative.toLowerCase().endsWith(".svg"));
const manifest=rasterAssets.map(relative=>({
  relative,
  source:path.join(root,...relative.split("/")),
  output:path.join(bundleAssetDir,`${crypto.createHash("sha1").update(relative).digest("hex")}.webp`)
}));
fs.writeFileSync(manifestFile,JSON.stringify(manifest));
const bundledPython=path.resolve(path.dirname(process.execPath),"..","..","python","python.exe");
const python=fs.existsSync(bundledPython)?bundledPython:"python";
const optimized=spawnSync(python,[path.join(root,"scripts/optimize-bundle-assets.py"),manifestFile],{stdio:"inherit"});
if(optimized.status!==0)throw new Error("圖片壓縮失敗，請確認 Pillow 可用。");
const optimizedByRelative=new Map(manifest.map(item=>[item.relative,item.output]));

for(const relative of assetPaths){
  const absolute=path.join(root,...relative.split("/"));
  if(!fs.existsSync(absolute))throw new Error(`找不到打包素材：${relative}`);
  const optimizedFile=optimizedByRelative.get(relative);
  const sourceFile=optimizedFile??absolute;
  const mime=optimizedFile?"image/webp":mimeTypes[path.extname(absolute).toLowerCase()];
  if(!mime)throw new Error(`不支援的素材格式：${relative}`);
  embedded.set(relative,`data:${mime};base64,${fs.readFileSync(sourceFile).toString("base64")}`);
}
for(const [relative,dataUri] of embedded){javascript=javascript.split(relative).join(dataUri);css=css.split(relative).join(dataUri);}

javascript=javascript.replaceAll("</script","<\\/script");
css=css.replaceAll("</style","<\\/style");
new vm.Script(javascript,{filename:"roamee-single-bundle.js"});

const html=`<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#fdfcf9" />
  <meta name="description" content="ROAMEE 展覽用行動版互動原型" />
  <title>ROAMEE — 掌握出遊衝動</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:wght@600;700&family=Noto+Sans+TC:wght@350;500;700&family=Noto+Serif+TC:wght@600;700;900&display=swap" rel="stylesheet" />
  <style>${css}</style>
</head>
<body>
  <main class="app-shell" id="app" aria-live="polite"></main>
  <script>${javascript}</script>
</body>
</html>`;

fs.writeFileSync(outputFile,html);
fs.rmSync(bundleAssetDir,{recursive:true,force:true});
fs.rmSync(manifestFile,{force:true});
const megabytes=(fs.statSync(outputFile).size/1024/1024).toFixed(1);
console.log(`完成：${outputFile}`);
console.log(`大小：${megabytes} MB｜內嵌素材：${embedded.size} 個`);
