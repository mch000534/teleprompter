# 待辦事項清單 (To-Do List)

基於 `requirements.md` 與 `spec.md` 的實作拆解。

## Phase 1: 專案基底與靜態結構 (Project Setup & Static UI)
- [x] **建立專案結構**
    - [x] 建立 `index.html`, `assets/css/style.css`, `assets/js/app.js`。
    - [x] 設定 HTML5 基礎模板與 Meta tags (RWD viewport)。
- [x] **實作 UI 佈局 (Layout)**
    - [x] 建立主要容器：`.app-container`。
    - [x] 建立控制面板區塊：`.control-panel` (包含 Textarea, Sliders, Buttons)。
    - [x] 建立提詞顯示區塊：`.teleprompter-display` 與內部滾動層 `.scroll-content`。
- [x] **基礎樣式 (CSS)**
    - [x] 定義 CSS Variables (Colors, Fonts)。
    - [x] 實作 Flexbox/Grid 佈局，將控制面板置底或置側。
    - [x] 設定顯示區的全黑背景與高對比文字樣式。

## Phase 2: 核心邏輯開發 (Core Logic Development)
- [x] **狀態管理模組 (State Store)**
    - [x] 實作 `State` 物件 (isPlaying, text, fontSize, speed, etc.)。
    - [x] 實作 `updateState()` 輔助函式 (integrated into updateUI)。
- [x] **UI 事件綁定 (Event Binding)**
    - [x] 監聽 `textarea` 輸入，即時更新顯示區文字。
    - [x] 監聽 `font-size` Slider，改變顯示區 CSS `font-size`。
    - [x] 監聽 `speed` Slider，更新 State 中的速度值。
- [x] **滾動引擎 (Scroll Engine)**
    - [x] 實作 `renderLoop()` 與 `requestAnimationFrame` 迴圈。
    - [x] 實作滾動位置計算邏輯 (`scrollTop += speed * multiplier`)。
    - [x] 實作 播放/暫停 按鈕邏輯。
    - [x] 實作 重置 (Reset) 按鈕邏輯。

## Phase 3: 進階功能與視覺效果 (Advanced Features & Visuals)
- [x] **畫面反轉功能 (Flip Feature)**
    - [x] 實作「上下反轉」Toggle 按鈕。
    - [x] 在 CSS 中新增 `.flipped` class (`transform: scaleY(-1)`).
    - [x] 綁定按鈕事件以切換 `.teleprompter-display` 的 class。
- [x] **鍵盤快捷鍵 (Keyboard Shortcuts)**
    - [x] 實作 `Space` 鍵切換播放/暫停。
    - [x] 實作 `Esc` 鍵重置或退出。
    - [x] (選用) `Up/Down` 鍵微調位置。

## Phase 3.5: 沉浸式體驗優化 (Immersive Experience)
- [x] **視線引導線**
    - [x] 新增 HTML `.guide-line` 元素。
    - [x] CSS 設定絕對定位於螢幕中央，半透明白色。
- [x] **播放模式 UI 切換**
    - [x] 在 `togglePlay()` (via `updateUI`) 中切換 Body class `.is-playing`。
    - [x] CSS 實作 `.is-playing` 狀態下的控制面板隱藏與顯示區全螢幕化。
    - [x] 確保暫停/重置時能恢復原狀。

## Phase 3.6: UI Refinements (Exit Button, Margins, Styling)
- [x] **Flip Indicator 樣式調整**
    - [x] 修改背景色為深灰色。
- [x] **退出播放按鈕**
    - [x] 在 HTML 新增 `#btnExit`。
    - [x] CSS 定位與反轉樣式 (`scaleY(-1)` when flipped)。
    - [x] JS 綁定點擊事件 (停止播放)。
- [x] **邊距控制 (Margin Control)**
    - [x] 新增 HTML Slider `#marginSlider`。
    - [x] JS `State.margin` 邏輯與 `updateUI` 連動 (控制 `.scroll-content` 寬度)。

    - [x] JS `State.margin` 邏輯與 `updateUI` 連動 (控制 `.scroll-content` 寬度)。
    - [x] **全頁設定模式 (Full Page Settings)**
        - [x] 修改 CSS 使 `.control-panel` 預設佔滿全螢幕。
        - [x] 播放時隱藏 `.control-panel` 並顯示 `.teleprompter-display`。
    - [x] **貼上按鈕 (Paste Button)**
        - [x] 新增貼上按鈕於輸入框旁。
        - [x] JS 實作剪貼簿讀取功能。

## Phase 3.7: Touch Interaction & Native Fullscreen Support
- [x] **觸控滾動 (Touch Scroll)**
    - [x] 監聽 `touchstart`, `touchmove`, `touchend`。
    - [x] 實作手動拖曳滾動邏輯。
    - [x] 解決與自動播放的衝突 (手勢時暫停)。
- [x] **全螢幕按鈕**
    - [x] HTML 新增 `#btnFullscreen`。
    - [x] JS 實作 `toggleFullscreen` 邏輯。
    - [x] CSS 樣式 (與 Exit 按鈕排版)。
    - [x] 連動邏輯：退出播放時自動退出全螢幕。

## Phase 4: 測試與優化 (Testing & Optimization)
- [ ] **功能驗收**
    - 驗證 AC 1.1 (文字輸入無卡頓)。
    - 驗證 AC 2.1 (字體大小即時預覽)。
    - 驗證 AC 3.1 (速度控制有效)。
    - 驗證 AC 4.1 & 4.2 (反轉顯示與反轉時的滾動方向正確性)。
- [ ] **邊界測試**
    - 測試空文字或極短文字的行為。
    - 測試滾動到底部的停止行為。
