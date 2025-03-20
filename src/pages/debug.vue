<template>
    <f7-page name="debug">
        <f7-navbar title="SDK调试">
            <f7-nav-right>
                <f7-link icon-only @click="openTokenPopover">
                    <i class="i-tabler-key-off w-6 h-6"></i>
                </f7-link>
                <f7-link icon-only @click="loginSheetOpened = true">
                    <i class="i-tabler-message-2-code w-6 h-6"></i>
                </f7-link>
            </f7-nav-right>
        </f7-navbar>

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

        <!-- Token设置弹窗 -->
        <f7-popover :opened="tokenPopoverOpened" @popover:closed="tokenPopoverOpened = false">
            <div class="p-4 w-80">
                <div class="text-sm mb-2">设置Token</div>
                <f7-list no-hairlines>
                    <f7-list-input
                        type="textarea"
                        placeholder="输入JWT Token"
                        :value="token"
                        @input="updateToken"
                        resizable
                    ></f7-list-input>
                </f7-list>
            </div>
        </f7-popover>

        <!-- 验证码登录Sheet -->
        <f7-sheet
            :opened="loginSheetOpened"
            @sheet:closed="loginSheetOpened = false"
            class="h-80"
            swipe-to-close
            backdrop
        >
            <f7-page-content>
                <div class="px-4 py-2">
                    <f7-list no-hairlines>
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
                            <f7-button slot="after" @click="getSmsCode" :disabled="smsButtonDisabled">
                                {{ smsButtonText }}
                            </f7-button>
                        </f7-list-item>
                        <f7-list-button @click="handleLogin">登录</f7-list-button>
                    </f7-list>
                </div>
            </f7-page-content>
        </f7-sheet>

        <!-- 功能区域 -->
        <div class="px-4 space-y-4">
            <!-- 用户相关API -->
            <div>
                <div class="text-sm opacity-60 mb-2">用户操作</div>
                <div class="grid grid-cols-3 gap-2">
                    <f7-button @click="checkAuthority" small>检查权限</f7-button>
                    <f7-button @click="getUserInfo" small>获取信息</f7-button>
                    <f7-button @click="signin" small>签到</f7-button>
                </div>
            </div>

            <!-- 车辆相关API -->
            <div>
                <div class="text-sm opacity-60 mb-2">车辆查询</div>
                <div class="grid grid-cols-3 gap-2">
                    <f7-button @click="getSurroundingCars" small>周围车辆</f7-button>
                    <f7-button @click="getCarInfo" small>车辆信息</f7-button>
                </div>
            </div>

            <!-- 订单相关API -->
            <div>
                <div class="text-sm opacity-60 mb-2">订单操作</div>
                <div class="grid grid-cols-3 gap-2">
                    <f7-button @click="orderCar" small>下单</f7-button>
                    <f7-button @click="currentCyclingOrder" small>获取订单</f7-button>
                    <f7-button @click="payWithBalance" small>支付</f7-button>
                </div>
            </div>

            <!-- 骑行控制 -->
            <div>
                <div class="text-sm opacity-60 mb-2">骑行控制</div>
                <div class="grid grid-cols-3 gap-2">
                    <f7-button @click="unlockCar" small>解锁</f7-button>
                    <f7-button @click="temporaryLockCar" small>临时锁车</f7-button>
                    <f7-button @click="backCar" small>还车</f7-button>
                </div>
            </div>
        </div>

        <!-- 结果显示 -->
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
import {
    f7,
    f7Page,
    f7Navbar,
    f7NavRight,
    f7Link,
    f7BlockTitle,
    f7List,
    f7ListInput,
    f7ListItem,
    f7ListButton,
    f7Block,
    f7Input,
    f7Button,
    f7Popover,
    f7Sheet,
    f7PageContent
} from 'framework7-vue';
import { SevenPace } from '../sdk';

const client = new SevenPace();
const token = ref('');
const phone = ref('');
const code = ref('');
const smsButtonText = ref('获取验证码');
const smsButtonDisabled = ref(false);
const countdown = ref(0);
const tokenPopoverOpened = ref(false);
const loginSheetOpened = ref(false);

const openTokenPopover = () => {
    tokenPopoverOpened.value = true;
};

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
        tokenPopoverOpened.value = false;
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
const handleLogin = async () => {
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
        loginSheetOpened.value = false;
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
