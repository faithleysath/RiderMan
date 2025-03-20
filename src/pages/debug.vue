<template>
    <f7-page name="debug">
        <f7-navbar title="SDK调试" />
        
        <!-- Token设置 -->
        <f7-block-title>Token设置</f7-block-title>
        <f7-list inline-labels no-hairlines-md>
            <f7-list-input
                label="Token"
                type="textarea"
                placeholder="输入JWT Token"
                :value="token"
                @input="updateToken"
            ></f7-list-input>
        </f7-list>
        
        <!-- 验证码登录 -->
        <f7-block-title>验证码登录</f7-block-title>
        <f7-list inline-labels no-hairlines-md>
            <f7-list-input
                label="手机号"
                type="tel"
                placeholder="输入手机号"
                :value="phone"
                @input="phone = $event.target.value"
            ></f7-list-input>
            <f7-list-item>
                <f7-input
                    type="text"
                    placeholder="验证码"
                    :value="code"
                    @input="code = $event.target.value"
                ></f7-input>
                <f7-button @click="getSmsCode" :disabled="smsButtonDisabled">
                    {{ smsButtonText }}
                </f7-button>
            </f7-list-item>
            <f7-list-button @click="login">登录</f7-list-button>
        </f7-list>

        <!-- 车辆操作 -->
        <f7-block-title>车辆操作</f7-block-title>
        <f7-list inline-labels no-hairlines-md>
            <f7-list-input
                label="车辆编号"
                type="text"
                placeholder="输入车辆编号"
                :value="carNumber"
                @input="carNumber = $event.target.value"
            ></f7-list-input>
        </f7-list>

        <f7-block-title>API测试</f7-block-title>
        <f7-block>
            <f7-list>
                <f7-list-button @click="checkAuthority">检查权限</f7-list-button>
                <f7-list-button @click="getUserInfo">获取用户信息</f7-list-button>
                <f7-list-button @click="getSurroundingCars">获取周围车辆</f7-list-button>
                <f7-list-button @click="getCarInfo">查看车辆信息</f7-list-button>
                <f7-list-button @click="orderCar">下单</f7-list-button>
                <f7-list-button @click="unlockCar">解锁</f7-list-button>
                <f7-list-button @click="temporaryLockCar">临时锁车</f7-list-button>
                <f7-list-button @click="backCar">还车</f7-list-button>
                <f7-list-button @click="currentCyclingOrder">获取当前订单</f7-list-button>
                <f7-list-button @click="payWithBalance">余额支付</f7-list-button>
                <f7-list-button @click="signin">签到</f7-list-button>
            </f7-list>
        </f7-block>

        <f7-block>
            <div class="space-y-2">
                <div class="font-bold">结果：</div>
                <pre class="bg-gray-100 p-4 rounded overflow-auto max-h-96">{{ result }}</pre>
            </div>
        </f7-block>
    </f7-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { f7, f7Page, f7Navbar, f7BlockTitle, f7List, f7ListInput, f7ListItem, f7ListButton, f7Block, f7Input } from 'framework7-vue';
import { SevenPace } from '../sdk';

const client = new SevenPace();
const token = ref('');
const phone = ref('');
const code = ref('');
const smsButtonText = ref('获取验证码');
const smsButtonDisabled = ref(false);
const countdown = ref(0);

// 倒计时函数
const startCountdown = () => {
    countdown.value = 60;
    smsButtonDisabled.value = true;
    const timer = setInterval(() => {
        countdown.value--;
        smsButtonText.value = `${countdown.value}秒后重试`;
        if (countdown.value <= 0) {
            clearInterval(timer);
            smsButtonText.value = '获取验证码';
            smsButtonDisabled.value = false;
        }
    }, 1000);
};

// 更新Token
const updateToken = (event: Event) => {
    const input = event.target as HTMLInputElement;
    token.value = input.value;
    if (token.value) {
        client.setToken(token.value);
        f7.toast.show({
            text: 'Token已更新',
            position: 'center',
            closeTimeout: 2000,
        });
    }
};

// 获取验证码
const getSmsCode = async () => {
    if (!phone.value) {
        f7.toast.show({
            text: '请输入手机号',
            position: 'center',
            closeTimeout: 2000,
        });
        return;
    }

    const [success, message] = await client.getSmsCode(phone.value);
    showResult(success, message);
    if (success) {
        startCountdown();
    }
};

// 登录
const login = async () => {
    if (!phone.value || !code.value) {
        f7.toast.show({
            text: '请输入手机号和验证码',
            position: 'center',
            closeTimeout: 2000,
        });
        return;
    }

    const [success, message] = await client.login(phone.value, code.value);
    showResult(success, message);
    if (success) {
        token.value = client.toDict().authorization.replace('Bearer ', '');
        f7.toast.show({
            text: '登录成功',
            position: 'center',
            closeTimeout: 2000,
        });
    }
};

// 车辆相关
const carNumber = ref('');
// 当前订单信息
const currentOrder = ref<null | { order_id: number; created_at: string }>(null);

const result = ref('点击按钮测试SDK功能');

const showResult = (success: boolean, data: any) => {
    result.value = JSON.stringify({
        success,
        data
    }, null, 2);
};

// API调用函数
const checkAuthority = async () => {
    const [success, message] = await client.checkAuthority();
    showResult(success, message);
};

const getUserInfo = async () => {
    const [success, info] = await client.getUserInfo(true);
    showResult(success, info);
};

const getSurroundingCars = async () => {
    const [success, cars] = await client.getSurroundingCars(118.70762235331449, 32.205375942712834);
    showResult(success, cars);
};

const getCarInfo = async () => {
    if (!carNumber.value) {
        f7.toast.show({
            text: '请输入车辆编号',
            position: 'center',
            closeTimeout: 2000,
        });
        return;
    }
    const [success, info] = await client.getCarInfo(carNumber.value);
    showResult(success, info);
};

const orderCar = async () => {
    if (!carNumber.value) {
        f7.toast.show({
            text: '请输入车辆编号',
            position: 'center',
            closeTimeout: 2000,
        });
        return;
    }
    const [success, message] = await client.orderCar(carNumber.value);
    showResult(success, message);
};

const unlockCar = async () => {
    const [success, message] = await client.unlockCar();
    showResult(success, message);
};

const temporaryLockCar = async () => {
    const [success, message] = await client.temporaryLockCar();
    showResult(success, message);
};

const backCar = async () => {
    const [success, message] = await client.backCar();
    showResult(success, message);
};

const currentCyclingOrder = async () => {
    const [success, order] = await client.currentCyclingOrder();
    showResult(success, order);
    if (success && order && typeof order !== 'string') {
        currentOrder.value = order;
        f7.toast.show({
            text: '当前订单已更新',
            position: 'center',
            closeTimeout: 2000,
        });
    }
};

const payWithBalance = async () => {
    if (!currentOrder.value) {
        f7.toast.show({
            text: '请先获取当前订单',
            position: 'center',
            closeTimeout: 2000,
        });
        return;
    }
    const [success, message] = await client.payWithBalance(
        currentOrder.value.order_id,
        currentOrder.value.created_at
    );
    showResult(success, message);
};

const signin = async () => {
    const [success, message] = await client.signin();
    showResult(success, message);
};
</script>
