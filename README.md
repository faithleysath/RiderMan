# 骑马侠
骑马侠是一款面向骑马爱好者的共享马匹平台应用，用户可以通过该应用快速找到附近的共享马匹（电动助力车），进行租赁、骑行和归还。应用采用骑马为主题的专业术语，为用户创造沉浸式的骑马体验。

## 应用主题化术语对应

| 原术语 | 骑马侠术语 |
|-------|----------|
| 共享单车/电动车 | 共享马匹 |
| 助力车(carmodel_id=2) | 骏马 |
| 单车(carmodel_id=1) | (不适配) |
| 租车 | 租马 |
| 还车 | 还马 |
| 解锁 | 上马 |
| 临时锁车 | 临时下马 |
| 电量 | 体力值 |
| 里程 | 奔跑里程 |
| 余额 | 马币 |
| 积分 | 马术积分 |


## 技术栈
- Vue3+Framework7+Pinia+TS
- Tauri

## Tauri插件
### clipboard-manager
使用剪贴板插件读取和写入系统剪贴板。
```javascript
import { writeText, readText } from '@tauri-apps/plugin-clipboard-manager';

// 将内容写到剪贴板
await writeText('Tauri is awesome!');

// 从剪贴板读取内容
const content = await readText();
console.log(content);
// Prints "Tauri is awesome!" to the console
```
### log
为你的 Tauri 应用程序配置日志记录。
```javascript
import { trace, info, error, attachConsole } from '@tauri-apps/plugin-log';

// 启用 TargetKind::Webview 后，这个函数将把日志打印到浏览器控制台
const detach = await attachConsole();

trace('Trace');
info('Info');
error('Error');

// 将浏览器控制台与日志流分离
detach();
```
### notification
使用通知提示插件以向你的用户发送原生通知。
```javascript
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification';

// 你有发送通知的权限吗？
let permissionGranted = await isPermissionGranted();

// 如果没有，我们需要请求它
if (!permissionGranted) {
  const permission = await requestPermission();
  permissionGranted = permission === 'granted';
}

// 一旦获得许可，我们就可以发送通知
if (permissionGranted) {
  sendNotification({ title: 'Tauri', body: 'Tauri is awesome!' });
}
```
### dialog
本机系统对话框.
#### 创建 Yes/No 对话框
显示一个带有 “Yes” 和 “No” 按钮的提问对话框。
```javascript
import { ask } from '@tauri-apps/plugin-dialog';

// 创建 Yes/No 对话框
const answer = await ask('This action cannot be reverted. Are you sure?', {
  title: 'Tauri',
  kind: 'warning',
});

console.log(answer);
// Prints boolean to the console
```
#### 创建 Ok/Cancel 对话框
显示一个带有 “Ok” 和 “Cancel” 按钮的提问对话框。
```javascript
import { confirm } from '@tauri-apps/plugin-dialog';

// Creates a confirmation Ok/Cancel dialog
const confirmation = await confirm(
  'This action cannot be reverted. Are you sure?',
  { title: 'Tauri', kind: 'warning' }
);

console.log(confirmation);
// Prints boolean to the console
```
#### 创建 Message 对话框
一个带有 “Ok” 按钮的消息对话框。请注意，如果用户关闭对话框，它将返回 false。
```javascript
import { message } from '@tauri-apps/plugin-dialog';

// Shows message
await message('File not found', { title: 'Tauri', kind: 'error' });
```
### store
简单、持久的键值存储。
```javascript
import { Store } from '@tauri-apps/plugin-store';

// Store 会在 JavaScript 绑定时自动加载。
const store = new Store('store.bin');

// 设置一个值。
await store.set('some-key', { value: 5 });

// 获取一个值。
const val = await store.get('some-key');
console.log(val); // { value: 5 }

// 您可以在进行更改后手动保存存储
// 否则如上所述，它将在正常退出时保存。
await store.save();
```
### geolocation
This plugin provides APIs for getting and tracking the device's current position, including information about altitude, heading, and speed (if available).
```javascript
import {
  checkPermissions,
  requestPermissions,
  getCurrentPosition,
  watchPosition
} from '@tauri-apps/plugin-geolocation'

let permissions = await checkPermissions()
if (
  permissions.location === 'prompt'
  || permissions.location === 'prompt-with-rationale'
) {
  permissions = await requestPermissions(['location'])
}

if (permissions.location === 'granted') {
  const pos = await getCurrentPosition()

  await watchPosition(
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    (pos) => {
      console.log(pos)
    }
  )
}
```
pos对象结构
```javascript
pos = {
    coords: {
        latitude: number,    // 纬度
        longitude: number,   // 经度
        accuracy: number,    // 精确度(米)
        altitude: number,    // 海拔
        altitudeAccuracy: number,  // 海拔精确度
        speed: number,      // 速度
        heading: number     // 方向角度(0-360)
    },
    timestamp: number      // 时间戳
}
```
### http
Make HTTP requests with the http plugin.
#### 1.Configure the allowed URLs
src-tauri/capabilities/default.json
```json
{
  "permissions": [
    {
      "identifier": "http:default",
      "allow": [{ "url": "https://*.tauri.app" }],
      "deny": [{ "url": "https://private.tauri.app" }]
    }
  ]
}
```

#### 2.Send a request
The fetch method tries to be as close and compliant to the fetch Web API as possible.
```javascript
import { fetch } from '@tauri-apps/plugin-http';

// Send a GET request
const response = await fetch('http://test.tauri.app/data.json', {
  method: 'GET',
});
console.log(response.status); // e.g. 200
console.log(response.statusText); // e.g. "OK"
```