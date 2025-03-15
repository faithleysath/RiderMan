# based on README.md
import requests
from typing import Union, Optional, Tuple, List
from datetime import datetime
from dataclasses import dataclass

# 导入jwt解析模块
import jwt

@dataclass(init=False)
class UserInfo:
    id: int  # 用户唯一标识，例如：1312860
    name: str  # 用户姓名，例如："吴天一"
    nickname: str  # 用户昵称，例如："djhdj"
    avatar: str  # 用户头像URL，例如：""
    phone: str  # 用户手机号，例如："133****8342"
    sex: int  # 用户性别（1为男性，2为女性，0为未知），例如：0
    admission_time: str  # 入学时间，例如："2022年 9月"
    wechat_openid: str  # 微信OpenID，例如："oUGHs4mDBSY2uXGDx51UjOsZxopQ"
    school_id: int  # 学校ID，例如：27
    school_name: str  # 学校名称，例如："南京信息工程大学"
    balance: str  # 账户余额，例如："7.40"
    points: int  # 用户积分，例如：37
    register_time: str  # 注册时间，例如："2022-09-12 10:27:32"
    client: str  # 客户端类型，例如："Wechat_MiniAPP"
    recent_finished_cycling_order_id: int  # 最近完成的骑行订单ID，例如：886984
    recent_finished_cycling_order_created_at: str  # 最近完成的骑行订单创建时间，例如："2025-03-09 10:16:31"
    current_cycling_order_state: int  # 当前骑行订单状态，例如：40
    current_cycling_order_id: int  # 当前骑行订单ID，例如：886984
    current_cycling_order_created_at: str  # 当前骑行订单创建时间，例如："2025-03-09 10:16:31"
    credits: Optional[int] = None  # 用户信用分，例如：10

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            # 如果key在dataclass中有定义，则赋值
            if key in self.__annotations__:
                setattr(self, key, value)
    
    def __iter__(self):
        for key in self.__annotations__:
            yield (key, getattr(self, key))

@dataclass(init=False)
class CarInfo:
    number: str  # 车辆编号，例如："23113529"
    carmodel_id: int  # 车辆型号ID，例如：1 单车 2 电动车
    longitude: Optional[float] = None  # 车辆经度，例如：118.798
    latitude: Optional[float] = None  # 车辆纬度，例如：32.055
    carmodel_name: Optional[str] = None  # 车辆型号名称，例如："单车"
    lock_title: Optional[str] = None  # 锁名称，例如："泰比特wa-209d中控"
    lock_status: Optional[int] = None  # 锁状态，例如：1 已锁 2 未锁 3 无状态
    electricity: Optional[str] = None # 电量，例如："100%"
    mileage: Optional[str] = None  # 里程，例如："0.00km"
    allow_temporary_lock: Optional[int] = None  # 是否允许临时锁车，例如：1 允许 0 不允许

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            # 如果key在dataclass中有定义，则赋值
            if key in self.__annotations__:
                setattr(self, key, value)

    def __iter__(self):
        for key in self.__annotations__:
            yield (key, getattr(self, key))

class SevenPace:
    def __init__(self, authorization: str = "Bearer eyJ0eX.....", expired_at: str = ""):
        self.base_url = "https://newmapi.7mate.cn/api/"
        self.headers = {
            # "phone-model": "Mac14,15", # 该字段会导致设备限制
            "phone-system": "Android", 
            "authorization": authorization,
            "client": "Wechat_MiniAPP",
            "phone-system-version": "Mac OS X 15.3.1",
            "content-type": "application/json",
            "accept": "application/vnd.ws.v1+json",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/6.8.0(0x16080000) NetType/WIFI MiniProgramEnv/Mac MacWechat/WMPF MacWechat/3.8.10(0x13080a10) XWEB/1227",
            "xweb_xhr": "1",
            "phone-brand": "apple",
            "app-version": "1.3.91",
            "sec-fetch-site": "cross-site", 
            "sec-fetch-mode": "cors",
            "sec-fetch-dest": "empty",
            "referer": "https://servicewechat.com/wx9a6a1a8407b04c5d/246/page-frame.html",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "zh-CN,zh;q=0.9"
        }
        self.expired_at: str = expired_at

    def to_dict(self) -> dict:
        return {
            'authorization': self.headers['authorization'],
            'expired_at': self.expired_at
        }
    
    def set_token(self, token: str, expired_at: Optional[str] = "") -> bool:
        try:
            jwt.decode(token, options={"verify_signature": False})
        except jwt.exceptions.DecodeError:
            return False
        self.headers["authorization"] = f"Bearer {token}"
        if not expired_at:
            # 从jwt中解析出exp
            expired_at = jwt.decode(token, options={"verify_signature": False})["exp"]
            expired_at = datetime.fromtimestamp(expired_at).strftime("%Y-%m-%d %H:%M:%S")
        self.expired_at = expired_at

    def get_sms_code(self, phone: Union[str, int]) -> Tuple[bool, str]:
        """
        获取短信验证码
        :param phone: 手机号
        :return: (是否成功, 提示信息)
        """
        url = self.base_url + "verificationcode"
        data = {
            "phone": phone,
            "scene": 1
        }
        response = requests.post(url, json=data, headers=self.headers)
        if response.status_code == 200:
            if response.json().get("status_code") == 200:
                return True, response.json().get("message")
            else:
                return False, response.json().get("message")
        else:
            return False, f"请求失败: {response.status_code}"
        
    def login(self, phone: Union[str, int], code: Union[str, int]) -> Tuple[bool, str]:
        """
        登录
        :param phone: 手机号
        :param code: 验证码
        :return: (是否成功, 提示信息)
        """
        url = self.base_url + "authorizations"
        data = {
            "phone": phone,
            "verification_code": code
        }
        response = requests.post(url, json=data, headers=self.headers)
        if response.status_code in (200, 201):
            if "status_code" in response.json():
                return False, response.json().get("message")
            else:
                self.headers["authorization"] = f"Bearer {response.json()['data']['token']}"
                self.expired_at = response.json()['data']['expired_at']
                return True, "登录成功"
        else:
            return False, f"请求失败: {response.status_code}"
        
    def get_user_info(self, need_credits=False) -> Tuple[bool, Union[UserInfo, str]]:
        """
        获取用户信息
        :param need_credits: 是否需要信用分
        :return: (是否成功, 用户信息或提示信息)
        """
        url = self.base_url + "user"
        response = requests.get(url, headers=self.headers)
        if response.status_code == 200:
            if "status_code" in response.json():
                return False, response.json().get("message")
            else:
                user_info = UserInfo(**response.json().get("data"))
                if not need_credits:
                    return True, user_info
        else:
            return False, f"请求失败: {response.status_code}"
        
        success, credits = self.get_user_credits()
        if success:
            user_info.credits = credits
            return True, user_info
        else:
            return False, credits
        
    def get_user_credits(self) -> Tuple[bool, Union[int, str]]:
        """
        获取用户信用分
        :return: (是否成功, 信用分或提示信息)
        """
        url = self.base_url + "user/credit_scores"
        response = requests.get(url, headers=self.headers)
        if response.status_code == 200:
            if "status_code" in response.json():
                return False, response.json().get("message")
            else:
                return True, response.json().get("data").get("credit_scores")
        else:
            return False, f"请求失败: {response.status_code}"
        
    def query_cmd(self, cmd: str) -> Tuple[bool, str]:
        """
        查询指令状态
        :param cmd: 指令
        :return: (是否成功, 提示信息)
        """
        url = self.base_url + f"cmd/query/{cmd}"
        response = requests.get(url, headers=self.headers)
        if response.status_code == 200:
            if response.json().get("status_code") == 200:
                ret = response.json().get("data").get("ret")
                if ret == 1:
                    return True, "成功"
                elif ret == 0:
                    return False, "处理中"
                elif ret == 2:
                    return False, "成功但有异常"
                elif ret == 3:
                    return False, "车辆离线"
                elif ret == 4:
                    return False, "失败"
            else:
                return False, response.json().get("message")
        else:
            return False, f"请求失败: {response.status_code}"
        
    def check_authority(self) -> Tuple[bool, str]:
        """
        检查用户是否有权限
        :return: (是否有权限, 提示信息)
        """
        url = self.base_url + "user/car_authority"
        response = requests.get(url, headers=self.headers)
        if response.status_code == 200:
            if 'data' in response.json():
                unauthorized_code = response.json().get("data").get("unauthorized_code")
                if unauthorized_code == 0:
                    return True, "有权限"
                elif unauthorized_code == 1:
                    return False, "未登录"
                elif unauthorized_code == 2:
                    return False, "未实名认证"
                elif unauthorized_code == 3:
                    return False, "实名认证中"
                elif unauthorized_code == 4:
                    return False, "实名认证失败"
                elif unauthorized_code == 5:
                    return False, "未充值或购买套餐卡"
                elif unauthorized_code == 6:
                    return False, "有进行中行程"
                elif unauthorized_code == 7:
                    return False, "有未支付订单"
                elif unauthorized_code == 8:
                    return False, "有待支付调度费"
                elif unauthorized_code == 9:
                    return False, "有待支付赔偿费"
                else:
                    return False, "未知错误"
            else:
                return False, "字段不存在"
        else:
            return False, f"请求失败: {response.status_code}"
        
    def order_car(self, car_number: str) -> Tuple[bool, str]:
        """
        下单共享单车（但不开锁，此时车锁状态为3）
        :param car_number: 车辆编号
        :return: (是否成功, 提示信息)
        """
        url = self.base_url + "order"
        data = {
            "order_type": 1,
            "car_number": car_number
        }
        response = requests.post(url, json=data, headers=self.headers)
        if response.status_code == 200:
            if response.json().get("status_code") == 200:
                return True, response.json().get("message")
            else:
                return False, response.json().get("message")
        else:
            return False, f"请求失败: {response.status_code}"

        
    def unlock_car(self) -> Tuple[bool, str]:
        """
        解锁车辆
        :return: (是否成功, 提示信息或指令)
        """
        url = self.base_url + "car/unlock"
        data = {"action_type": 1}
        response = requests.post(url, json=data, headers=self.headers)
        if response.status_code == 200:
            if response.json().get("status_code") == 200:
                return True, response.json().get("data").get("cmd")
            else:
                return False, response.json().get("message")
        else:
            return False, f"请求失败: {response.status_code}"
        
    def temporary_lock_car(self) -> Tuple[bool, str]:
        """
        临时锁车
        :return: (是否成功, 提示信息或指令)
        """
        url = self.base_url + "car/lock"
        data = {"action_type": 1}
        response = requests.post(url, json=data, headers=self.headers)
        if response.status_code == 200:
            if response.json().get("status_code") == 200:
                return True, response.json().get("data").get("cmd")
            else:
                return False, response.json().get("message")
        else:
            return False, f"请求失败: {response.status_code}"
        
    def back_car(self) -> Tuple[bool, str]:
        """
        还车
        :return: (是否成功, 提示信息或指令)
        """
        url = self.base_url + "car/lock"
        data = {"action_type": 2}
        response = requests.post(url, json=data, headers=self.headers)
        if response.status_code == 200:
            if response.json().get("status_code") == 200:
                return True, response.json().get("data").get("cmd")
            else:
                return False, response.json().get("message")
        else:
            return False, f"请求失败: {response.status_code}"
        
    def get_surrounding_cars(self, longitude: float, latitude: float) -> Tuple[bool, Union[List[CarInfo], str]]:
        """
        获取周围车辆（车辆信息只有编号、车型、经纬度），无需登录
        :param longitude: 经度
        :param latitude: 纬度
        :return: (是否成功, 车辆信息列表或提示信息)
        """
        url = self.base_url + "surrounding/car"
        params = {
            "longitude": longitude,
            "latitude": latitude
        }
        response = requests.get(url, params=params, headers=self.headers)
        if response.status_code == 200:
            if response.json().get("status_code") == 200:
                data = response.json().get("data")
                cars = [CarInfo(**car) for car in data]
                return True, cars
            else:
                return False, response.json().get("message")
        else:
            return False, f"请求失败: {response.status_code}"
        
    def get_car_info(self, car_number: str, need_location=True) -> Tuple[bool, Union[CarInfo, str]]:
        """""
        获取车辆信息
        :param car_number: 车辆编号
        :param need_location: 是否需要车辆位置
        :return: (是否成功, 车辆信息或提示信息)"
        """
        url = self.base_url + f"car/{car_number}"
        response = requests.get(url, headers=self.headers)
        if response.status_code == 200:
            if "status_code" in response.json():
                return False, response.json().get("message")
            else:
                car_info = CarInfo(**response.json().get("data"))
                if not need_location:
                    return True, car_info
        else:
            return False, f"请求失败: {response.status_code}"
        
        success, location = self.get_car_location(car_number)
        if success:
            car_info.longitude = location.get("longitude")
            car_info.latitude = location.get("latitude")
            return True, car_info
        else:
            return False, location
        
    def get_car_location(self, car_number: str) -> Tuple[bool, Union[dict, str]]:
        """"
        获取车辆位置
        :param car_number: 车辆编号
        :return: (是否成功, 位置信息或提示信息)
        """
        url = self.base_url + f"car/{car_number}/location"
        response = requests.get(url, headers=self.headers)
        if response.status_code == 200:
            if "status_code" in response.json():
                return False, response.json().get("message")
            else:
                return True, response.json().get("data")
        else:
            return False, f"请求失败: {response.status_code}"
        
    def current_cycling_order(self) -> Tuple[bool, str]:
        """
        获取当前骑行订单
        :return: (是否成功, 提示信息)
        """
        url = self.base_url + "order/cycling"
        response = requests.get(url, headers=self.headers)
        if response.status_code == 200:
            if "status_code" in response.json():
                return False, response.json().get("message")
            else:
                data = response.json().get("data")
                if data:
                    ret = {
                        "order_id": data.get("order_id"),
                        "car_number": data.get("car_number"),
                        "carmodel_id": data.get("carmodel_id"),
                        "car_start_time": data.get("car_start_time"),
                        "car_end_time": data.get("car_end_time"),
                        "estimated_cost": data.get("estimated_cost"), # 预估费用（骑行中看这个）
                        "order_amount": data.get("order_amount"), # 订单金额（骑行中为0）
                        "order_state": data.get("order_state"), # 20是骑行中，30是待支付，40是已完成
                        "electricity": data.get("electricity"),
                        "mileage": data.get("mileage"),
                        "created_at": data.get("created_at")
                    }
                    return True, ret
                else:
                    return False, "无骑行订单"
        else:
            return False, f"请求失败: {response.status_code}"
        
    def pay_with_balance(self, order_id: Union[str,int], order_time: str) -> Tuple[bool, str]:
        """
        余额支付
        :param order_id: 订单ID
        :param order_time: 订单时间
        :return: (是否成功, 提示信息)
        """
        url = self.base_url + "payment/pay"
        data = {
            "payment_id": 1,
            "order_id": str(order_id),
            "order_type": 1,
            "created_at": order_time
        }
        response = requests.post(url, json=data, headers=self.headers)
        if response.status_code == 200:
            if "status_code" in response.json():
                return False, response.json().get("message")
            else:
                return True, "支付成功"
        else:
            return False, f"请求失败: {response.status_code}"
        
    def signin(self) -> Tuple[bool, str]:
        """
        签到
        :return: (是否成功, 提示信息)
        """
        url = self.base_url + "signin"
        data = {}
        response = requests.post(url, json=data, headers=self.headers)
        if response.status_code == 200:
            if response.json().get("status_code") == 200:
                return True, response.json().get("data").get("desc")
            else:
                return False, response.json().get("message")
        else:
            return False, f"请求失败: {response.status_code}"
        
if __name__ == "__main__":
    client = SevenPace()
    client.set_token('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9uZXdtYXBpLjdtYXRlLmNuXC9hcGlcL21pbmlhcHBcL2F1dGhfY29kZSIsImlhdCI6MTc0MTYxNzM5MiwiZXhwIjoxNzQ0MjA5MzkyLCJuYmYiOjE3NDE2MTczOTIsImp0aSI6IjlaRHdKYU9ValZjblRwS0MiLCJzdWIiOjEzMTI4NjAsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.eQoUZNr9rYhtCPTaxhv1uB58dxp4UCRR19YE-gfQNao')

    # 0. 检查用户权限
    success, message = client.check_authority()
    if success:
        print(message)
    else:
        print(message)
    # 1. 获取用户信息
    success, user_info = client.get_user_info()
    if success:
        print(user_info)
    else:
        print(user_info)
    # 2. 获取周围车辆
    success, cars = client.get_surrounding_cars(118.70762235331449, 32.205375942712834)
    if success:
        for car in cars:
            print(car)
    else:
        print(cars)
    # 3. 选一个合适的车辆，查看具体信息
    success, car_info = client.get_car_info("24072277")
    if success:
        print(car_info)
    else:
        print(car_info)
    # 4. 下单
    success, message = client.order_car("24072277")
    if success:
        print(message)
    else:
        print(message)
    # 5. 解锁
    success, message = client.unlock_car()
    if success:
        print(message)
    else:
        print(message)
    # 6. 临时锁车
    success, message = client.temporary_lock_car()
    if success:
        print(message)
    else:
        print(message)
    # 7. 开锁
    success, message = client.unlock_car()
    if success:
        print(message)
    else:
        print(message)
    # 8. 还车
    success, message = client.back_car()
    if success:
        print(message)
    else:
        print(message)
    # 9. 获取当前骑行订单
    success, message = client.current_cycling_order()
    if success:
        print(message)
        order = message
    else:
        print(message)
    # 10. 余额支付
    success, message = client.pay_with_balance(order["order_id"], order["created_at"])
    if success:
        print(message)
    else:
        print(message)
    # 11. 签到
    success, message = client.signin()
    if success:
        print(message)
    else:
        print(message)