import { fetch } from '@tauri-apps/plugin-http';
import { jwtDecode } from 'jwt-decode';
import {
  UserInfo,
  CarInfo,
  ApiResponse,
  CyclingOrder,
  ResponseTuple
} from './types';

export class SevenPace {
  private baseUrl: string;
  private headers: Record<string, string>;
  private expiredAt: string;

  constructor(authorization: string = "Bearer eyJ0eX.....", expiredAt: string = "") {
    this.baseUrl = "https://newmapi.7mate.cn/api/";
    this.headers = {
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
      "accept-language": "zh-CN,zh;q=0.9",
      "origin": "https://newmapi.7mate.cn",
    };
    this.expiredAt = expiredAt;
  }

  toDict(): { authorization: string; expired_at: string } {
    return {
      authorization: this.headers.authorization,
      expired_at: this.expiredAt
    };
  }

  setToken(token: string, expiredAt: string = ""): boolean {
    try {
      jwtDecode(token);
      this.headers.authorization = `Bearer ${token}`;
      if (!expiredAt) {
        const decoded: any = jwtDecode(token);
        expiredAt = new Date(decoded.exp * 1000).toISOString()
          .replace("T", " ")
          .replace(/\.\d+Z$/, "");
      }
      this.expiredAt = expiredAt;
      return true;
    } catch {
      return false;
    }
  }

  async getSmsCode(phone: string | number): ResponseTuple<string> {
    try {
      const response = await fetch(`${this.baseUrl}verificationcode`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          phone,
          scene: 1
        })
      });
      const data: ApiResponse<any> = await response.json();
      if (response.status === 200) {
        if (data.status_code === 200) {
          return [true, data.message || ""];
        }
        return [false, data.message || ""];
      }
      return [false, `请求失败: ${response.status}`];
    } catch (error) {
      return [false, `请求异常: ${error}`];
    }
  }

  async login(phone: string | number, code: string | number): ResponseTuple<string> {
    try {
      const response = await fetch(`${this.baseUrl}authorizations`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          phone,
          verification_code: code
        })
      });
      const data: ApiResponse<{ token: string; expired_at: string }> = await response.json();
      
      if (response.status === 200 || response.status === 201) {
        if (data.status_code !== undefined) {
          return [false, data.message || ""];
        }
        if (data.data) {
          this.headers.authorization = `Bearer ${data.data.token}`;
          this.expiredAt = data.data.expired_at;
          return [true, "登录成功"];
        }
      }
      return [false, `请求失败: ${response.status}`];
    } catch (error) {
      return [false, `请求异常: ${error}`];
    }
  }

  async getUserInfo(needCredits = false): ResponseTuple<UserInfo> {
    try {
      const response = await fetch(`${this.baseUrl}user`, {
        headers: this.headers
      });
      const data: ApiResponse<UserInfo> = await response.json();
      
      if (response.status === 200) {
        if (data.status_code !== undefined) {
          return [false, data.message || ""];
        }
        if (data.data) {
          const userInfo: UserInfo = data.data;
          if (!needCredits) {
            return [true, userInfo];
          }

          const [success, credits] = await this.getUserCredits();
          if (success && typeof credits === "number") {
            userInfo.credits = credits;
            return [true, userInfo];
          }
          return [false, credits.toString()];
        }
      }
      return [false, `请求失败: ${response.status}`];
    } catch (error) {
      return [false, `请求异常: ${error}`];
    }
  }

  async getUserCredits(): ResponseTuple<number> {
    try {
      const response = await fetch(`${this.baseUrl}user/credit_scores`, {
        headers: this.headers
      });
      const data: ApiResponse<{ credit_scores: number }> = await response.json();
      
      if (response.status === 200) {
        if (data.status_code !== undefined) {
          return [false, data.message || ""];
        }
        if (data.data) {
          return [true, data.data.credit_scores];
        }
      }
      return [false, `请求失败: ${response.status}`];
    } catch (error) {
      return [false, `请求异常: ${error}`];
    }
  }

  async queryCmd(cmd: string): ResponseTuple<string> {
    try {
      const response = await fetch(`${this.baseUrl}cmd/query/${cmd}`, {
        headers: this.headers
      });
      const data: ApiResponse<{ ret: number }> = await response.json();
      
      if (response.status === 200) {
        if (data.status_code === 200 && data.data) {
          const ret = data.data.ret;
          if (ret === 1) return [true, "成功"];
          if (ret === 0) return [false, "处理中"];
          if (ret === 2) return [false, "成功但有异常"];
          if (ret === 3) return [false, "车辆离线"];
          if (ret === 4) return [false, "失败"];
        }
        return [false, data.message || ""];
      }
      return [false, `请求失败: ${response.status}`];
    } catch (error) {
      return [false, `请求异常: ${error}`];
    }
  }

  async checkAuthority(): ResponseTuple<string> {
    try {
      const response = await fetch(`${this.baseUrl}user/car_authority`, {
        headers: this.headers
      });
      const data: ApiResponse<{ unauthorized_code: number }> = await response.json();
      
      if (response.status === 200) {
        if (data.data) {
          const code = data.data.unauthorized_code;
          const messages: Record<number, string> = {
            0: "有权限",
            1: "未登录",
            2: "未实名认证",
            3: "实名认证中",
            4: "实名认证失败",
            5: "未充值或购买套餐卡",
            6: "有进行中行程",
            7: "有未支付订单",
            8: "有待支付调度费",
            9: "有待支付赔偿费"
          };
          return [code === 0, messages[code] || "未知错误"];
        }
        return [false, "字段不存在"];
      }
      return [false, `请求失败: ${response.status}`];
    } catch (error) {
      return [false, `请求异常: ${error}`];
    }
  }

  async orderCar(carNumber: string): ResponseTuple<string> {
    try {
      const response = await fetch(`${this.baseUrl}order`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          order_type: 1,
          car_number: carNumber
        })
      });
      const data: ApiResponse<any> = await response.json();
      
      if (response.status === 200) {
        if (data.status_code === 200) {
          return [true, data.message || ""];
        }
        return [false, data.message || ""];
      }
      return [false, `请求失败: ${response.status}`];
    } catch (error) {
      return [false, `请求异常: ${error}`];
    }
  }

  async unlockCar(): ResponseTuple<string> {
    try {
      const response = await fetch(`${this.baseUrl}car/unlock`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          action_type: 1
        })
      });
      const data: ApiResponse<{ cmd: string }> = await response.json();
      
      if (response.status === 200) {
        if (data.status_code === 200 && data.data) {
          return [true, data.data.cmd];
        }
        return [false, data.message || ""];
      }
      return [false, `请求失败: ${response.status}`];
    } catch (error) {
      return [false, `请求异常: ${error}`];
    }
  }

  async temporaryLockCar(): ResponseTuple<string> {
    try {
      const response = await fetch(`${this.baseUrl}car/lock`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          action_type: 1
        })
      });
      const data: ApiResponse<{ cmd: string }> = await response.json();
      
      if (response.status === 200) {
        if (data.status_code === 200 && data.data) {
          return [true, data.data.cmd];
        }
        return [false, data.message || ""];
      }
      return [false, `请求失败: ${response.status}`];
    } catch (error) {
      return [false, `请求异常: ${error}`];
    }
  }

  async backCar(): ResponseTuple<string> {
    try {
      const response = await fetch(`${this.baseUrl}car/lock`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          action_type: 2
        })
      });
      const data: ApiResponse<{ cmd: string }> = await response.json();
      
      if (response.status === 200) {
        if (data.status_code === 200 && data.data) {
          return [true, data.data.cmd];
        }
        return [false, data.message || ""];
      }
      return [false, `请求失败: ${response.status}`];
    } catch (error) {
      return [false, `请求异常: ${error}`];
    }
  }

  async getSurroundingCars(longitude: number, latitude: number): ResponseTuple<CarInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}surrounding/car?longitude=${longitude}&latitude=${latitude}`, {
        headers: this.headers
      });
      const data: ApiResponse<CarInfo[]> = await response.json();
      
      if (response.status === 200) {
        if (data.status_code === 200 && data.data) {
          return [true, data.data];
        }
        return [false, data.message || ""];
      }
      return [false, `请求失败: ${response.status}`];
    } catch (error) {
      return [false, `请求异常: ${error}`];
    }
  }

  async getCarInfo(carNumber: string, needLocation = true): ResponseTuple<CarInfo> {
    try {
      const response = await fetch(`${this.baseUrl}car/${carNumber}`, {
        headers: this.headers
      });
      const data: ApiResponse<CarInfo> = await response.json();
      
      if (response.status === 200) {
        if (data.status_code !== undefined) {
          return [false, data.message || ""];
        }
        if (data.data) {
          const carInfo = data.data;
          if (!needLocation) {
            return [true, carInfo];
          }

          const [success, location] = await this.getCarLocation(carNumber);
          if (success && typeof location === "object") {
            carInfo.longitude = location.longitude;
            carInfo.latitude = location.latitude;
            return [true, carInfo];
          }
          return [false, location.toString()];
        }
      }
      return [false, `请求失败: ${response.status}`];
    } catch (error) {
      return [false, `请求异常: ${error}`];
    }
  }

  async getCarLocation(carNumber: string): ResponseTuple<{ longitude: number; latitude: number }> {
    try {
      const response = await fetch(`${this.baseUrl}car/${carNumber}/location`, {
        headers: this.headers
      });
      const data: ApiResponse<{ longitude: number; latitude: number }> = await response.json();
      
      if (response.status === 200) {
        if (data.status_code !== undefined) {
          return [false, data.message || ""];
        }
        if (data.data) {
          return [true, data.data];
        }
      }
      return [false, `请求失败: ${response.status}`];
    } catch (error) {
      return [false, `请求异常: ${error}`];
    }
  }

  async currentCyclingOrder(): ResponseTuple<CyclingOrder | null> {
    try {
      const response = await fetch(`${this.baseUrl}order/cycling`, {
        headers: this.headers
      });
      const data: ApiResponse<CyclingOrder> = await response.json();
      
      if (response.status === 200) {
        if (data.status_code !== undefined) {
          return [false, data.message || ""];
        }
        if (data.data) {
          return [true, data.data];
        }
        return [true, null];
      }
      return [false, `请求失败: ${response.status}`];
    } catch (error) {
      return [false, `请求异常: ${error}`];
    }
  }

  async payWithBalance(orderId: string | number, orderTime: string): ResponseTuple<string> {
    try {
      const response = await fetch(`${this.baseUrl}payment/pay`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          payment_id: 1,
          order_id: orderId.toString(),
          order_type: 1,
          created_at: orderTime
        })
      });
      const data: ApiResponse<any> = await response.json();
      
      if (response.status === 200) {
        if (data.status_code !== undefined) {
          return [false, data.message || ""];
        }
        return [true, "支付成功"];
      }
      return [false, `请求失败: ${response.status}`];
    } catch (error) {
      return [false, `请求异常: ${error}`];
    }
  }

  async signin(): ResponseTuple<string> {
    try {
      const response = await fetch(`${this.baseUrl}signin`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({})
      });
      const data: ApiResponse<{ desc: string }> = await response.json();
      
      if (response.status === 200) {
        if (data.status_code === 200 && data.data) {
          return [true, data.data.desc];
        }
        return [false, data.message || ""];
      }
      return [false, `请求失败: ${response.status}`];
    } catch (error) {
      return [false, `请求异常: ${error}`];
    }
  }
}
