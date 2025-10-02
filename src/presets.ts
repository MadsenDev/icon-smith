export type PresetKey = "web" | "android" | "ios" | "windows" | "desktop";

type Task = {
  path: string;
  size: number;
  padPct?: number;
  monochrome?: boolean;
};

type Preset = {
  label: string;
  tasks: readonly Task[];
  extras?: readonly [string, string][];
};

export const Presets: Record<PresetKey, Preset> = {
  web: {
    label: "Web (PWA)",
    tasks: [
      { path: "web/icon-192.png", size: 192 },
      { path: "web/icon-512.png", size: 512 },
      { path: "web/icon-192-maskable.png", size: 192, padPct: 0.12 },
      { path: "web/icon-512-maskable.png", size: 512, padPct: 0.12 },
      { path: "web/apple-touch-icon.png", size: 180 },
      { path: "web/favicon-16.png", size: 16 },
      { path: "web/favicon-32.png", size: 32 },
      { path: "web/favicon-48.png", size: 48 },
    ],
  },
  android: {
    label: "Android",
    tasks: [
      { path: "android/play_store_512.png", size: 512 },
      { path: "android/res/mipmap-mdpi/ic_launcher.png", size: 48 },
      { path: "android/res/mipmap-hdpi/ic_launcher.png", size: 72 },
      { path: "android/res/mipmap-xhdpi/ic_launcher.png", size: 96 },
      { path: "android/res/mipmap-xxhdpi/ic_launcher.png", size: 144 },
      { path: "android/res/mipmap-xxxhdpi/ic_launcher.png", size: 192 },
      { path: "android/res/mipmap-anydpi-v26/ic_launcher_foreground.png", size: 432 },
      {
        path: "android/res/mipmap-anydpi-v26/ic_launcher_monochrome.png",
        size: 432,
        monochrome: true,
      },
    ],
    extras: [
      [
        "android/res/mipmap-anydpi-v26/ic_launcher.xml",
        `<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n  <background android:drawable="@android:color/transparent"/>\n  <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n  <monochrome android:drawable="@mipmap/ic_launcher_monochrome"/>\n</adaptive-icon>`,
      ],
    ],
  },
  ios: {
    label: "iOS",
    tasks: [
      { path: "ios/AppIcon-20@2x.png", size: 40 },
      { path: "ios/AppIcon-20@3x.png", size: 60 },
      { path: "ios/AppIcon-29.png", size: 29 },
      { path: "ios/AppIcon-29@2x.png", size: 58 },
      { path: "ios/AppIcon-29@3x.png", size: 87 },
      { path: "ios/AppIcon-40@2x.png", size: 80 },
      { path: "ios/AppIcon-40@3x.png", size: 120 },
      { path: "ios/AppIcon@2x.png", size: 120 },
      { path: "ios/AppIcon@3x.png", size: 180 },
      { path: "ios/AppIcon-20~ipad.png", size: 20 },
      { path: "ios/AppIcon-20@2x~ipad.png", size: 40 },
      { path: "ios/AppIcon-29~ipad.png", size: 29 },
      { path: "ios/AppIcon-29@2x~ipad.png", size: 58 },
      { path: "ios/AppIcon-40~ipad.png", size: 40 },
      { path: "ios/AppIcon-40@2x~ipad.png", size: 80 },
      { path: "ios/AppIcon~ipad.png", size: 76 },
      { path: "ios/AppIcon@2x~ipad.png", size: 152 },
      { path: "ios/AppIcon-83.5@2x~ipad.png", size: 167 },
      { path: "ios/AppIcon~ios-marketing.png", size: 1024 },
    ],
    extras: [
      [
        "ios/Contents.json",
        JSON.stringify(
          {
            images: [
              { idiom: "iphone", size: "20x20", scale: "2x", filename: "AppIcon-20@2x.png" },
              { idiom: "iphone", size: "20x20", scale: "3x", filename: "AppIcon-20@3x.png" },
              { idiom: "iphone", size: "29x29", scale: "1x", filename: "AppIcon-29.png" },
              { idiom: "iphone", size: "29x29", scale: "2x", filename: "AppIcon-29@2x.png" },
              { idiom: "iphone", size: "29x29", scale: "3x", filename: "AppIcon-29@3x.png" },
              { idiom: "iphone", size: "40x40", scale: "2x", filename: "AppIcon-40@2x.png" },
              { idiom: "iphone", size: "40x40", scale: "3x", filename: "AppIcon-40@3x.png" },
              { idiom: "iphone", size: "60x60", scale: "2x", filename: "AppIcon@2x.png" },
              { idiom: "iphone", size: "60x60", scale: "3x", filename: "AppIcon@3x.png" },
              { idiom: "ipad", size: "20x20", scale: "1x", filename: "AppIcon-20~ipad.png" },
              { idiom: "ipad", size: "20x20", scale: "2x", filename: "AppIcon-20@2x~ipad.png" },
              { idiom: "ipad", size: "29x29", scale: "1x", filename: "AppIcon-29~ipad.png" },
              { idiom: "ipad", size: "29x29", scale: "2x", filename: "AppIcon-29@2x~ipad.png" },
              { idiom: "ipad", size: "40x40", scale: "1x", filename: "AppIcon-40~ipad.png" },
              { idiom: "ipad", size: "40x40", scale: "2x", filename: "AppIcon-40@2x~ipad.png" },
              { idiom: "ipad", size: "76x76", scale: "1x", filename: "AppIcon~ipad.png" },
              { idiom: "ipad", size: "76x76", scale: "2x", filename: "AppIcon@2x~ipad.png" },
              { idiom: "ipad", size: "83.5x83.5", scale: "2x", filename: "AppIcon-83.5@2x~ipad.png" },
              { idiom: "ios-marketing", size: "1024x1024", scale: "1x", filename: "AppIcon~ios-marketing.png" },
            ],
            info: { version: 1, author: "xcode" },
          },
          null,
          2,
        ),
      ],
    ],
  },
  windows: {
    label: "Windows (.ico)",
    tasks: [
      { path: "windows/ico-16.png", size: 16 },
      { path: "windows/ico-24.png", size: 24 },
      { path: "windows/ico-32.png", size: 32 },
      { path: "windows/ico-48.png", size: 48 },
      { path: "windows/ico-64.png", size: 64 },
      { path: "windows/ico-128.png", size: 128 },
      { path: "windows/ico-256.png", size: 256 },
    ],
  },
  desktop: {
    label: "Linux / Desktop PNGs",
    tasks: [
      { path: "desktop/icon-16.png", size: 16 },
      { path: "desktop/icon-24.png", size: 24 },
      { path: "desktop/icon-32.png", size: 32 },
      { path: "desktop/icon-48.png", size: 48 },
      { path: "desktop/icon-64.png", size: 64 },
      { path: "desktop/icon-128.png", size: 128 },
      { path: "desktop/icon-256.png", size: 256 },
      { path: "desktop/icon-512.png", size: 512 },
    ],
  },
};

