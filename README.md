# NodeJS 使用者驗證系統

使用 Express 和 Passport 實做的使用者驗證系統，提拱登入、註冊與 API 使用權限管理。<br/>
A user authentication system implemented using expresss and passport.

## Features

1. Passport 本地驗證
2. Passport Oauth2 驗證 ( KeyCloak, Google, Github, Gitlab, Discord, Twitch)
3. 使用者瀏覽權限管理，例如開通與否、使用者身分等
4. 基於 MVC ( model–view–controller ) 架構

## Environment

- [node.js & npm](https://nodejs.org/en/download)
- [mongodb](https://www.mongodb.com/try/download/community)

## Usage

- 前置作業：
  - 於 MongoDB 中建立資料庫及使用者
  - ( Optional ) 部分 Oauth issuer 的 callback url 不得設定為 localhost ( 如 google )，因此需提供可用的域名或是設定本機 domain 規則 ( 詳見 #Advanced )。

1. 複製 `.env.template` 重新命名為 `.env`，並根據需求編輯環境變數：

   - 伺服器參數設定
     - SERVER_HOST：伺服器主機名稱 ( hostname )
     - SERVER_PORT：伺服器服務埠號 ( port )
     - COOKIE_MAX_AGE：Cookie 預設保存時間 ( ms )
     - SESSION_SECRET：Session 雜湊值
   - 日誌紀錄設定
     - LOG_LEVEL：Log 紀錄等級 ( 參考 [winston](https://www.npmjs.com/package/winston) )
     - LOG_FOLDER：Log 檔案儲存位置
     - LOG_MAX_FILES：Log 檔案保留天數
     - LOG_MAX_SIZE：Log 單一檔案大小限制
   - 資料庫參數設定
     - MONGODB_HOST：MongoDB 主機名稱 ( hostname )
     - MONGODB_PORT：MongoDB 服務埠號 ( port )
     - MONGODB_USER：MongoDB 使用者名稱
     - MONGODB_PAWD：MongoDB 使用者密碼
     - MONGODB_DBNAME：MongoDB 資料庫名稱
   - KeyCloak Oauth2 參數設定
     - KeyCloak_OAUTH2_CLIENT_ID：KeyCloak client ID
     - KeyCloak_OAUTH2_CLIENT_SECRET：KeyCloak client secret
     - KeyCloak_OAUTH2_ISSUER：KeyCloak 主機網址 ( /realms/realmName )
   - Google Oauth2 參數設定
     - GOOGLE_OAUTH2_CLIENT_ID：Google client ID
     - GOOGLE_OAUTH2_CLIENT_SECRET：Google client secret
   - GitHub Oauth2 參數設定
     - GITHUB_OAUTH2_CLIENT_ID：GitHub client ID
     - GITHUB_OAUTH2_CLIENT_SECRET：GitHub client secret
   - GitLab Oauth2 參數設定
     - GITLAB_OAUTH2_CLIENT_ID：GitLab client ID
     - GITLAB_OAUTH2_CLIENT_SECRET：GitLab client secret
     - GITLAB_OAUTH2_ISSUER：GitLab 主機網址
   - Discord Oauth2 參數設定
     - DISCORD_OAUTH2_CLIENT_ID：Discord client ID
     - DISCORD_OAUTH2_CLIENT_SECRET：Discord client secret
   - Twitch Oauth2 參數設定
     - TWITCH_OAUTH2_CLIENT_ID：Twitch client ID
     - TWITCH_OAUTH2_CLIENT_SECRET：Twitch client secret

2. 安裝套件
   ```cmd
   npm install
   ```
3. 啟動 server
   ```cmd
   npm start
   ```
4. 開啟瀏覽器：https://localhost:8081 or {SERVER_HOST}:{SERVER_PORT}
5. 註冊一個帳號或是使用其他登入方式登入
6. 開啟 MongoDB，將使用者的 `isActivated` 欄位改為 `true` 開通使用者
7. 重新登入即可進入系統

## System structure

- server.js：Start point
- routes.js：Main router setting
- .env.template：Environmental variables template
- /api：Router module ( controller )
- /models：Function module ( model )
- /public：Static files ( view )
- /views：Render page ( view )
- /logs：Logs file

## Model structure

- Passport 驗證模組 ( `./models/passport/index.js` )
  - 定義 serializeUser, deserializeUser, login 驗證函數
  - 引入驗證模組 ( `./models/passport/modules` )
- MongoDB 模組 ( `./models/mongodb/index.js` )
  - MongoDB 連線設定
  - MongoDB 資料表設定 ( `./models/mongodb/modules` )：欄位定義等
- Logger 模組
  - log 格式設定參閱：[winston](https://www.npmjs.com/package/winston) 及 ./models/logger/index.js<br/>
  - log 儲存設定參閱：[winston-daily-rotate-file](https://www.npmjs.com/package/winston-daily-rotate-file)

## Controller structure

- 主路由 ( `./routes.js` )
  - 定義路由設定，並引入其他 router 模組
  - 需要登入驗證才能存取的 API，請於 API 加入 `isLogin` 或 `isAdminLogin` middleware
    ```javascript
    app.get("/auth", isLogin, (req, res) => {
      return res.status(200).send("You are login");
    });
    ```
- 使用者驗證路由 ( `./api/user/index.js` )
  - 定義 login, login callback, signup, logout 之 API
  - 引入 router 路由模組 ( `./api/user/controller` )
- 檔案系統路由 ( `./api/file/index.js` )

## View structure

- 靜態檔案 ( `./public` )
- 伺服器渲染頁面 ( `./views` ) 並於 `server.js` 設定渲染引擎
  ```javascript
  app.set("view engine", "pug");
  app.set("views", "./views");
  ```

## Advanced

### 新增驗證模組

1. 於 `./models/passport/modules` 新增驗證模組，並加入 Passport 中。
2. 於 `./api/user/controller` 新增路由設定
3. 於 `./api/user/index.js` 引入上述路由模組

### 使用 http 或 https server

- 開啟 `server.js`
- 使用 http server 請使用以下設定，並註解 https server 設定

  ```javascript
  // Start http server
  const host = process.env.SERVER_HOST || "http://localhost";
  const port = process.env.SERVER_PORT || "80";

  app.listen(port, () => {
    logger.info(`Server listening on ${host}:${port}`);
  });
  ```

- 使用 https server 請使用以下設定，及確定金鑰檔案位置，並註解 http server 設定
  ```javascript
  // Start https server
  const fs = require("fs");
  const https = require("https");
  let hskey = fs.readFileSync("./localhost+1-key.pem", "utf8");
  let hscert = fs.readFileSync("./localhost+1.pem", "utf8");
  const server = https.createServer({ key: hskey, cert: hscert }, app);
  server.listen(port, function () {
    logger.info(`Server runing on ${host}:${port}`);
  });
  ```
- 重啟 server

### 本地 domain 設定 ( windows )

- 編輯檔案：`C:\WINDOWS\system32\drivers\etc\hosts`
- 於下方新增設定 "`127.0.0.1 mylocalhost.com`"：mylocalhost.com 為自定義 domain，並導向至本機 127.0.0.1

  ```
  # Copyright (c) 1993-2009 Microsoft Corp.
  #
  # This is a sample HOSTS file used by Microsoft TCP/IP for Windows.
  #
  # This file contains the mappings of IP addresses to host names. Each
  # entry should be kept on an individual line. The IP address should
  # be placed in the first column followed by the corresponding host name.
  # The IP address and the host name should be separated by at least one
  # space.
  #
  # Additionally, comments (such as these) may be inserted on individual
  # lines or following the machine name denoted by a '#' symbol.
  #
  # For example:
  #
  #      102.54.94.97     rhino.acme.com          # source server
  #       38.25.63.10     x.acme.com              # x client host

  # localhost name resolution is handled within DNS itself.
  #	127.0.0.1       localhost
  #	::1             localhost
  127.0.0.1 mylocalhost.com
  ```

- 將 `.env` 的 `SERVER_HOST` 參數設定為對應協定及 domain ( 如 `https://mylocalhost.com` )
- 開啟瀏覽器需使用該 domain 開啟

### Oauth application 申請網頁

- Google：https://console.cloud.google.com/apis/credentials/consent
- GitHub：https://github.com/settings/developers
- GitLab：https://YOUR.GITLAB.SERVER/-/profile/applications
- Discord：https://discord.com/developers/applications
- Twitch：https://dev.twitch.tv/console/apps

### 驗證與驗證流程
- 註冊流程：
  - 檢查使用者是否建立 ( 預設檢查 account )
  - 將密碼進行 <b>雜湊 ( hash )</b> 及 <b>加鹽 ( add salt )</b>，並儲存為 `{salt}.{hashPwd}` ( `./models/passport/hash.js` )
  - 儲存至資料庫中
- 驗證流程：
  - API middleware 呼叫驗證模組
  - ( 本地驗證 ) 取得資料庫密碼及鹽，將輸入密碼進行雜湊與加鹽處理，比對是否正確
  - ( Oauth驗證 ) 導向 oauth endpoint 等待 callback，檢查 account 是否存在 (若有則建立使用者，反之導向登入)
