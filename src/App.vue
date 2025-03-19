<template>
    <f7-app v-bind="f7params">
        <f7-navbar>
            <f7-nav-title>方位指示器</f7-nav-title>
        </f7-navbar>

        <f7-page>
                <compass :distance="currentDistance" :angle="currentAngle" />
                <!-- 测试控制器 -->
                <f7-block-title>控制面板</f7-block-title>
                <f7-list strong-ios dividers-ios inset-ios>
                    <f7-list-input
                        outline
                        label="距离"
                        floating-label
                        type="number"
                        placeholder="输入距离（米）"
                        clear-button
                        v-model:value="currentDistance"
                    >
                        <template #media>
                            <f7-icon icon="ruler" />
                        </template>
                    </f7-list-input>

                    <f7-list-input
                        outline
                        label="角度"
                        floating-label
                        type="number"
                        placeholder="输入角度 (-180° 到 180°)"
                        clear-button
                        :min="-180"
                        :max="180"
                        v-model:value="currentAngle"
                    >
                        <template #media>
                            <f7-icon icon="compass" />
                        </template>
                    </f7-list-input>
                </f7-list>
        </f7-page>
    </f7-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
    f7, f7ready, f7App, f7Navbar, f7NavTitle, 
    f7Page, f7BlockTitle, f7List, f7ListInput,
    f7Icon
} from 'framework7-vue';
import routes from './routes/router';
import tauriApp from './tauri-app';
import Compass from './components/compass.vue';

// 测试数据
const currentDistance = ref(100);
const currentAngle = ref(0);

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

<style>


</style>
