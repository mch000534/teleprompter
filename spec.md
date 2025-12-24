# 技術規格書 (Technical Specification)

## 1. 系統架構 (System Architecture)
本系統採用 **單頁應用程式 (SPA)** 架構，使用原生 HTML/CSS/JavaScript 開發，不依賴任何外部框架或程式庫。重點在於低延遲的 DOM 操作與高效的動畫渲染。

### 1.1 模組劃分
- **UI Controller**: 負責 DOM 元素的選取、事件監聽綁定 (Event Binding) 與 UI 狀態更新。
- **Teleprompter Engine**: 核心邏輯層，負責處理滾動計算、速度控制與狀態管理。
- **State Store**: 簡單的狀態管理物件，保存當前應用程式的設定值。

## 2. 數據結構與狀態管理 (Data Structures & State)
系統將維護一個全域的 State 物件，用於驅動 UI 與邏輯：

```javascript
State = {
  isPlaying: boolean,      // 是否正在播放
  text: string,            // 提詞稿內容
  fontSize: number,        // 字體大小 (px/rem)
  speed: number,           // 滾動速度 (1-10, 或 pixels/frame)
  isFlipped: boolean,      // 是否上下反轉
  scrollPosition: number   // 當前滾動位置 (float)
}
```

## 3. 核心邏輯實作 (Core Logic Implementation)

### 3.1 平滑滾動機制 (Smooth Scrolling)
為了確保滾動的流暢度，**不使用** `setInterval`，而是採用 `window.requestAnimationFrame`。

- **邏輯流程**:
  1.  在 `renderLoop` 函數中，檢查 `State.isPlaying`。
  2.  若為 true，更新 `State.scrollPosition += State.speed * SpeedMultiplier`。
  3.  將計算出的位置應用於提詞容器的 DOM 屬性：`element.scrollTop = State.scrollPosition`。
      - *注意*：由於 `scrollTop` 只能是整數，為了更平滑的低速滾動，我們需在變數中累加浮點數，只在賦值時取整。
  4.  遞迴呼叫 `requestAnimationFrame(renderLoop)`。

### 3.2 速度控制 (Speed Control)
- **輸入**: 用戶透過 Range Slider 輸入 1~100 的數值。
- **轉換**: 將 Slider 值映射到每幀移動的像素量 (Pixels Per Frame, PPF)。
  - 例如：速度 1 = 0.5 PPF, 速度 100 = 10 PPF。
  - 需要一個非線性的映射函數 (如對數或平方曲線)，讓低速時的微調更精細。

### 3.3 畫面反轉 (Flip Logic)
- **技術**: CSS Transforms。
- **實作**:
  - 當 `State.isFlipped` 為 true 時，在提詞顯示區的容器 (Container) 上添加 CSS class `.flipped`。
  - css 規則: `.flipped { transform: scaleY(-1); }`
  - *考量*: 使用 `scaleY(-1)` 會導致滾動軸方向也相反嗎？
    - 實際上 CSS Transform 只改變渲染視覺，不影響佈局流 (Layout flow) 或滾動方向邏輯。Javascript 繼續增加 `scrollTop` 依然會讓內容「在視覺上」向上移動 (因為整個容器被鏡像了)。

## 4. UI/UX 互動設計

### 4.1 佈局結構 (DOM Layout)
頁面分為兩大主要區域：
1.  **控制面板 (Control Panel)**: 固定於底部或側邊 (可隱藏)，包含輸入框、字體滑桿、速度滑桿、播放/暫停按鈕、反轉切換開關。
2.  **提詞顯示區 (Prompter Display)**: 佔據剩餘版面，背景全黑，文字高亮。

### 4.2 事件處理 (Event Handling)
- **Input Change**: 即時更新 `State.text` 並渲染至顯示區。
- **Window Resize**: 重新計算容器高度，確保滾動邊界正確。
- **Keyboard Shortcuts**:
  - `Space`: 切換 播放/暫停。
  - `Up/Down Arrow`: 微調滾動位置。
  - `Esc`: 退出全螢幕 (如果支援) 或重置。

### 4.3 沉浸式播放模式 (Immersive Playback Mode)
- **觸發條件**: 當 `State.isPlaying` 變為 `true` 時啟動；變為 `false` 時退出。
- **UI 行為**:
  - 在 Root 容器 (`.app-container` 或 `body`) 新增 `.is-playing` class。
  - CSS 規則 `.is-playing .control-panel` 設為 `display: none` 或移出視窗。
  - CSS 規則 `.is-playing .teleprompter-display` 設為 `height: 100vh`。
- **視線引導線 (Eye-line Guide)**:
  - 在 `.teleprompter-display` 中新增一個絕對定位的 `div.guide-line`。
  - 樣式: `top: 50%`, `width: 100%`, `border-top: 1px solid rgba(255,255,255,0.3)`.
  - 此線必須位於 Z-index 最上層 (但在 Flip 容器內或外需考量，若在外則不受 Flip 影響，若在內則也會被 Flip)。
    - *決策*: 建議置於 `.teleprompter-display` 內部但獨立於 `.scroll-content`，這樣它固定不動。若需跟隨畫面反轉 (即線條位置不變但邏輯上反轉?) -> 線條是水平對稱的，反轉沒影響，除非有文字標記。純線條可忽略反轉影響。
- **退出按鈕 (Exit Button)**:
  - 在 `.teleprompter-display` 內新增一個固定浮動按鈕。
  - 需設定 `transform: scaleY(-1)` 如果父容器被反轉，以確保文字方向正確。
  - 點擊觸發 `togglePlay()` 或 `resetScroll()`。
- **全螢幕按鈕 (Fullscreen Button)**:
  - 在 `.teleprompter-display` 內新增按鈕 (e.g., `#btnFullscreen`)。
  - 使用 `document.documentElement.requestFullscreen()` 與 `document.exitFullscreen()`。
  - 需監聽 `fullscreenchange` 事件以更新按鈕圖示 (選用)。
  - *注意*: 當退出播放模式時，若處於全螢幕，應自動退出全螢幕。

### 4.4 樣式與邊距控制
- **邊距 (Margin)**:
  - 新增 Slider (0% - 40%)。
  - 更新 `State.margin`。
  - 應用於 `.scroll-content` 的 `padding-left` 與 `padding-right`，或直接改變 `width` (例如 100% - margin*2)。
    - *建議*: 修改 CSS Variable `--content-width` 或直接 JS style `width`. 簡單作法：JS update `.scroll-content.style.width = (100 - State.margin * 2) + '%'`。

## 5. 邊界情況處理 (Edge Cases)
- **文字過短**: 當內容不足一頁時，不需要滾動。邏輯需判斷 `scrollHeight > clientHeight` 才啟動滾動。
- **滾動到底**: 當 `scrollPosition` 到達底部時，自動停止播放 (`State.isPlaying = false`) 或循環播放 (視未來擴充需求而定，目前先實作停止)。
