#!/bin/bash

# 设置默认target
TARGET=${1:-"aarch64"}

# 检查Android SDK环境变量
if [ -z "$ANDROID_HOME" ]; then
    echo "错误: 未设置ANDROID_HOME环境变量"
    exit 1
fi

# 设置build-tools版本
BUILD_TOOLS_VERSION="34.0.0"
BUILD_TOOLS_PATH="$ANDROID_HOME/build-tools/$BUILD_TOOLS_VERSION"

if [ ! -d "$BUILD_TOOLS_PATH" ]; then
    echo "错误: 未找到build-tools $BUILD_TOOLS_VERSION"
    echo "请通过Android Studio的SDK Manager安装对应版本"
    exit 1
fi

# 确保distribution目录存在
mkdir -p distribution

# 构建APK
echo "开始构建APK..."
echo "使用target: $TARGET"
yarn tauri android build --apk --target $TARGET

# 检查APK是否构建成功
APK_PATH="src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk"
if [ ! -f "$APK_PATH" ]; then
    echo "APK构建失败!"
    exit 1
fi

# 检查keystore是否存在
KEYSTORE_PATH="android.keystore"
if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "未找到签名证书，正在生成新的证书..."
    keytool -genkey -v -keystore $KEYSTORE_PATH -keyalg RSA -keysize 2048 -validity 10000 -alias riderman \
        -dname "CN=RiderMan, OU=Development, O=RiderMan, L=Unknown, ST=Unknown, C=CN" \
        -storepass riderman -keypass riderman
fi

# 签名APK
echo "开始签名APK..."
SIGNED_APK="distribution/riderman-release.apk"
mkdir -p distribution

"$BUILD_TOOLS_PATH/apksigner" sign \
    --ks "$KEYSTORE_PATH" \
    --ks-pass pass:riderman \
    --out "$SIGNED_APK" \
    "$APK_PATH"

# 验证签名
echo "验证签名..."
"$BUILD_TOOLS_PATH/apksigner" verify "$SIGNED_APK"

echo "完成！签名后的APK位于: $SIGNED_APK"
