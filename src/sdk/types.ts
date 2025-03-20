// User information interface
export interface UserInfo {
  id: number; // 用户唯一标识，例如：1312860
  name: string; // 用户姓名，例如："吴天一"
  nickname: string; // 用户昵称，例如："djhdj"
  avatar: string; // 用户头像URL，例如：""
  phone: string; // 用户手机号，例如："133****8342"
  sex: number; // 用户性别（1为男性，2为女性，0为未知），例如：0
  admission_time: string; // 入学时间，例如："2022年 9月"
  wechat_openid: string; // 微信OpenID，例如："oUGHs4mDBSY2uXGDx51UjOsZxopQ"
  school_id: number; // 学校ID，例如：27
  school_name: string; // 学校名称，例如："南京信息工程大学"
  balance: string; // 账户余额，例如："7.40"
  points: number; // 用户积分，例如：37
  register_time: string; // 注册时间，例如："2022-09-12 10:27:32"
  client: string; // 客户端类型，例如："Wechat_MiniAPP"
  recent_finished_cycling_order_id: number; // 最近完成的骑行订单ID，例如：886984
  recent_finished_cycling_order_created_at: string; // 最近完成的骑行订单创建时间，例如："2025-03-09 10:16:31"
  current_cycling_order_state: number; // 当前骑行订单状态，例如：40
  current_cycling_order_id: number; // 当前骑行订单ID，例如：886984
  current_cycling_order_created_at: string; // 当前骑行订单创建时间，例如："2025-03-09 10:16:31"
  credits?: number; // 用户信用分，例如：10
}

// Car information interface
export interface CarInfo {
  number: string; // 车辆编号，例如："23113529"
  carmodel_id: number; // 车辆型号ID，例如：1 单车 2 电动车
  longitude?: number; // 车辆经度，例如：118.798
  latitude?: number; // 车辆纬度，例如：32.055
  carmodel_name?: string; // 车辆型号名称，例如："单车"
  lock_title?: string; // 锁名称，例如："泰比特wa-209d中控"
  lock_status?: number; // 锁状态，例如：1 已锁 2 未锁 3 无状态
  electricity?: string; // 电量，例如："100%"
  mileage?: string; // 里程，例如："0.00km"
  allow_temporary_lock?: number; // 是否允许临时锁车，例如：1 允许 0 不允许
}

// API Response type
export interface ApiResponse<T> {
  status_code?: number;
  message?: string;
  data?: T;
}

// Current cycling order type
export interface CyclingOrder {
  order_id: number;
  car_number: string;
  carmodel_id: number;
  car_start_time: string;
  car_end_time: string;
  estimated_cost: string;
  order_amount: string;
  order_state: number;
  electricity: string;
  mileage: string;
  created_at: string;
}

// Response tuple type simulating Python's Tuple[bool, Union[T, string]]
export type ResponseTuple<T> = Promise<[boolean, T | string]>;
