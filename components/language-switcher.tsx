'use client';

import {  useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { supportedLocales } from '@/lib/constants';


export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (newLocale: string) => {
    // Remove current locale from pathname and add new locale
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    router.push(newPath);
  };

  const currentLocale = supportedLocales.find(l => l.value === locale);

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={locale} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-auto min-w-[120px] border-none shadow-none">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{currentLocale?.flag}</span>
              <span className="inline">{currentLocale?.label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {supportedLocales.map((localeOption) => (
            <SelectItem key={localeOption.value} value={localeOption.value}>
              <div className="flex items-center gap-2">
                <span>{localeOption.flag}</span>
                <span>{localeOption.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}