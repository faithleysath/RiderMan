# 骑马侠

## 技术栈
- Vue3+Framework7+Pinia+TS
- Tauri

## Tauri插件
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