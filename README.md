# irregular-density｜密度偵探社

一套適合國中理化課程使用的互動教材。學生可在瀏覽器中操作電子天平、量筒與排水法，測量不規則物體的質量、體積與密度，再依據參考密度判斷材料。

## 功能

- 電子天平歸零與質量測量
- 量筒排水動畫與視差模擬
- 氣泡誤差與排除操作
- 五個漸進式材料鑑定關卡
- 體積、密度計算與材料判斷
- 即時提示、扣分與錯誤回饋
- 課後反思題
- 教師模式：提示、自動填值、氣泡與挑戰模式
- 實驗紀錄下載（JSON）
- 手機、平板與電腦皆可使用
- 不需後端、不需資料庫

## 專案結構

```text
irregular-density/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── data/
│   └── levels.json
├── .nojekyll
├── LICENSE
└── README.md
```

## 本機預覽

由於關卡資料透過 `fetch()` 讀取，請不要直接雙擊 `index.html`。可使用任何靜態伺服器：

### Python

```bash
python3 -m http.server 8000
```

接著開啟：

```text
http://localhost:8000
```

### VS Code

安裝 Live Server 擴充套件後，對 `index.html` 選擇 **Open with Live Server**。

## 部署到 GitHub Pages

1. 在 GitHub 建立新的 repository，例如 `irregular-density`。
2. 將本專案所有檔案上傳到 repository 根目錄。
3. 進入 repository 的 **Settings**。
4. 選擇左側的 **Pages**。
5. 在 **Build and deployment**：
   - Source 選擇 `Deploy from a branch`
   - Branch 選擇 `main`
   - Folder 選擇 `/ (root)`
6. 按下 **Save**。

部署完成後網址通常為：

```text
https://educatres.github.io/irregular-density/
```

## 自訂關卡

編輯 `data/levels.json`。每一關包含：

```json
{
  "id": "aluminum",
  "title": "任務 1：鑑定神秘金屬",
  "description": "任務說明",
  "objectName": "銀灰零件",
  "symbol": "⬟",
  "mass": 54,
  "initialWater": 40,
  "volume": 20,
  "material": "鋁",
  "color": "#9aa9ad",
  "bubble": false
}
```

系統會自動計算：

- 放入後水量＝`initialWater + volume`
- 密度＝`mass / volume`

注意：目前材料下拉選單寫在 `index.html` 中。新增全新材料時，也要同步加入 `materialSelect` 的選項。

## 教學建議

- 示範模式：開啟提示與自動填值。
- 練習模式：開啟提示，關閉自動填值。
- 挑戰模式：關閉提示，開啟挑戰模式與氣泡誤差。
- 可要求學生完成後下載 JSON 紀錄，作為學習單附件。

## 技術

- HTML5
- CSS3
- Vanilla JavaScript
- LocalStorage
- Web Audio API

## 授權

MIT License
