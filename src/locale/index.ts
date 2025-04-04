import { createI18n } from "vue-i18n";
import enUS from "./lang/en-US.json";
import zhCN from "./lang/zh-CN.json";

// Read more about Typescript Support: https://vue-i18n.intlify.dev/guide/advanced/typescript.html
type MessageSchema = typeof zhCN;

const i18n = createI18n<[MessageSchema], "en-US" | "zh-CN">({
  legacy: false,
  globalInjection: true,
  locale: "zh-CN",
  fallbackLocale: "zh-CN",
  messages: {
    "en-US": enUS,
    "zh-CN": zhCN,
  },
});

export default i18n;
