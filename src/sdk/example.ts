import { SevenPace } from './sdk';
import { CarInfo } from './types';

// 创建实例并设置token
const client = new SevenPace();
client.setToken('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9uZXdtYXBpLjdtYXRlLmNuXC9hcGlcL21pbmlhcHBcL2F1dGhfY29kZSIsImlhdCI6MTc0MTYxNzM5MiwiZXhwIjoxNzQ0MjA5MzkyLCJuYmYiOjE3NDE2MTczOTIsImp0aSI6IjlaRHdKYU9ValZjblRwS0MiLCJzdWIiOjEzMTI4NjAsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.eQoUZNr9rYhtCPTaxhv1uB58dxp4UCRR19YE-gfQNao');

async function main() {
  try {
    // 0. 检查用户权限
    const [authSuccess, authMessage] = await client.checkAuthority();
    console.log('权限检查:', authSuccess ? '成功' : '失败', authMessage);

    // 1. 获取用户信息
    const [userSuccess, userInfo] = await client.getUserInfo();
    if (userSuccess) {
      console.log('用户信息:', userInfo);
    } else {
      console.error('获取用户信息失败:', userInfo);
    }

    // 2. 获取周围车辆
    const [carsSuccess, cars] = await client.getSurroundingCars(118.70762235331449, 32.205375942712834);
    if (carsSuccess && Array.isArray(cars)) {
      console.log('周围车辆:');
      cars.forEach((car: CarInfo) => console.log(car));
    } else {
      console.error('获取周围车辆失败:', cars);
    }

    // 3. 选一个车辆查看具体信息
    const [carInfoSuccess, carInfo] = await client.getCarInfo("24072277");
    if (carInfoSuccess) {
      console.log('车辆信息:', carInfo);
    } else {
      console.error('获取车辆信息失败:', carInfo);
    }

    // 4. 下单
    const [orderSuccess, orderMessage] = await client.orderCar("24072277");
    console.log('下单结果:', orderSuccess ? '成功' : '失败', orderMessage);

    // 5. 解锁
    const [unlockSuccess, unlockMessage] = await client.unlockCar();
    console.log('解锁结果:', unlockSuccess ? '成功' : '失败', unlockMessage);

    // 6. 临时锁车
    const [tempLockSuccess, tempLockMessage] = await client.temporaryLockCar();
    console.log('临时锁车结果:', tempLockSuccess ? '成功' : '失败', tempLockMessage);

    // 7. 开锁
    const [reUnlockSuccess, reUnlockMessage] = await client.unlockCar();
    console.log('再次解锁结果:', reUnlockSuccess ? '成功' : '失败', reUnlockMessage);

    // 8. 还车
    const [backSuccess, backMessage] = await client.backCar();
    console.log('还车结果:', backSuccess ? '成功' : '失败', backMessage);

    // 9. 获取当前骑行订单
    const [orderInfoSuccess, orderInfo] = await client.currentCyclingOrder();
    if (orderInfoSuccess && orderInfo && typeof orderInfo !== 'string') {
      console.log('当前订单:', orderInfo);

      // 10. 余额支付
      const [paySuccess, payMessage] = await client.payWithBalance(
        orderInfo.order_id,
        orderInfo.created_at
      );
      console.log('支付结果:', paySuccess ? '成功' : '失败', payMessage);
    } else {
      console.log('没有进行中的订单');
    }

    // 11. 签到
    const [signinSuccess, signinMessage] = await client.signin();
    console.log('签到结果:', signinSuccess ? '成功' : '失败', signinMessage);

  } catch (error) {
    console.error('执行过程中出现错误:', error);
  }
}

// 导出示例函数
export { main };

// 如果直接运行此文件，则执行示例
if (import.meta.url.endsWith('example.ts')) {
  main();
}
