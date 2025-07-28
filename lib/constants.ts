import type { ExpirationOption } from "@/types/common/types"

export const expirationOptions: Record<ExpirationOption, string> = {
  1: "1",
  3: "3",
  7: "7",
  30: "30",
}


export const supportedLocales = [
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { value: 'zh-TW', label: '繁体中文', flag: '🇨🇳' },
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' }
];