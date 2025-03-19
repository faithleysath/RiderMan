<template>
  <div class="compass-container">
    <!-- 刻度条 -->
    <div class="scale-bar" :class="barColorClass">
      <!-- 左侧刻度 -180 to 0 -->
      <div class="scale-left">
        <span>-165°</span>
        <span>-109°</span>
        <span>-53°</span>
      </div>
      
      <!-- 中央距离显示 -->
      <div class="distance-display" :class="distanceColorClass">
        {{ distance }} m
      </div>
      
      <!-- 右侧刻度 0 to 180 -->
      <div class="scale-right">
        <span>53°</span>
        <span>109°</span>
        <span>165°</span>
      </div>

      <!-- 指针 -->
      <div class="pointer" :style="{ left: pointerPosition }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';

const props = defineProps({
    distance : {
        type: Number,
        default: 0
    },
    angle : {
        type: Number,
        default: 0
    }
});

// 计算指针位置
const pointerPosition = computed(() => {
    // 将角度转换为整数并映射到0-100%的位置
    const intAngle = Math.round(props.angle);
    const position = ((intAngle + 180) / 360) * 100;
    return `${position}%`;
});

// 计算颜色类名
const barColorClass = computed(() => {
    const angle = Math.abs(props.angle);
    if (angle <= 53) return 'green';
    if (angle <= 109) return 'yellow';
    return 'red';
});

// 计算距离颜色类名
const distanceColorClass = computed(() => {
    if (props.distance <= 50) return 'green';
    if (props.distance <= 150) return 'yellow';
    return 'red';
});
</script>

<style scoped>
.compass-container {
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    position: relative;
    height: 60px;
}

.scale-bar {
    position: absolute;
    width: calc(100% - 20px);
    height: 40px;
    background: #f5f5f5;
    border-radius: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 40px;
    box-sizing: border-box;
    left: 10px;
    top: 10px;
}

.scale-bar.green {
    background: #4CAF50;
}

.scale-bar.yellow {
    background: #FFC107;
}

.scale-bar.red {
    background: #F44336;
}

/* 显示距离背景颜色和字体颜色，和bar的颜色不同 */
.distance-display.green {
    background: #3f9141;
    color: white;
}

.distance-display.yellow {
    background: #f9a825;
    color: white;
}

.distance-display.red {
    background: #d32f2f;
    color: white;
}

.scale-left, .scale-right {
    display: flex;
    justify-content: space-between;
    width: 35%;
    color: white;
    font-size: 12px;
    z-index: 1;
}

.distance-display {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 16px;
    font-weight: bold;
    z-index: 1;
    padding: 2px 8px;
    border-radius: 10px;
    /* 投影 */
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}

.pointer {
    position: absolute;
    top: 0;
    width: 2px;
    height: 40px;
    background: white;
    transform: translateX(-50%);
    transition: left 0.3s ease;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}
</style>
