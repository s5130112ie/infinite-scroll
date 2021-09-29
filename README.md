# infinite-scroll

1.請使用npm start啟動 localhost:3000
2.src/component/search/Search.tsx
可以設定 pageSize 目前為100

src/redux/repoSearch/slice.ts
可以設定 Octokit({ auth: `` }); 為自己的key 目前為不傳入

簡單說明
由滾動的位置監聽是否到達底部
並撈取對應新的頁面內容後 重新更新資料面以及現有的捲軸位置
將現有的渲染改為使用虛擬dom元素判斷捲軸位置後顯示對應內容
