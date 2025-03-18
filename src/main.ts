import { createApp } from 'vue'
import { createPinia } from 'pinia'
import i18n from "./locale";
import Framework7 from "framework7/lite-bundle";
import Framework7Vue, { registerComponents } from 'framework7-vue/bundle';
import App from './App.vue'

import "framework7/css/bundle";
import 'uno.css'
import './app.css';

// 初始化 Framework7-Vue 插件
Framework7.use(Framework7Vue);

const app = createApp(App);

// 注册所有 Framework7 Vue 组件
registerComponents(app);

app.use(createPinia())

app.use(i18n)

app.mount('#app')