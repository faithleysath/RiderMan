<template>
    <f7-app v-bind="f7params">
        <f7-views tabs>
            <f7-toolbar tabbar bottom>
                <f7-link tab-link="#home" tab-link-active>
                    <i class="i-tabler-home w-6 h-6"></i>
                    <span class="ta">主页</span>
                </f7-link>
                <f7-link tab-link="#profile">
                    <i class="i-tabler-user w-6 h-6"></i>
                    <span class="normal-case text-sm">马术中心</span>
                </f7-link>
            </f7-toolbar>

            <f7-view id="home" main tab tab-active url="/"></f7-view>
            <f7-view id="profile" name="profile" tab url="/profile/"></f7-view>
        </f7-views>

    </f7-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { 
    f7, f7ready, f7App, f7Views, f7Toolbar, f7Link, f7View
} from 'framework7-vue';
import routes from './routes/router';
import tauriApp from './tauri-app';

const f7params = {
    name: '骑马侠',
    theme: 'auto',
    id: 'com.riderman.app',
    routes: routes,
};

onMounted(() => {
    f7ready(() => {
        tauriApp.init(f7);
    })
})
</script>
