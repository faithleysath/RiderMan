<template>
    <f7-app v-bind="f7params">
        <f7-navbar>
            <f7-nav-title>{{  }}</f7-nav-title>
            <f7-nav-right>
                <f7-link href="https://qq.com">Right Link</f7-link>
            </f7-nav-right>
        </f7-navbar>
    </f7-app>
</template>
<script setup lang="ts">
import { onMounted } from 'vue';
import { f7, f7ready, f7App, f7Navbar, f7NavRight, f7NavTitle, f7Link } from 'framework7-vue';
import routes from './routes/router';
import tauriApp from './tauri-app';

const f7params = {
    name: '骑马侠', // App name
    theme: 'auto', // Automatic theme detection
    id: 'com.riderman.app', // App bundle ID
    // App routes
    routes: routes,
};

onMounted(() => {
    f7ready(() => {
        // 初始化 Tauri 应用功能
        tauriApp.init(f7);
    })
})
</script>
