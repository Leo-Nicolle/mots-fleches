import { createI18n } from "vue-i18n";

export function loadLanguages() {
    const context = import.meta.glob("./languages/*.ts", { eager: true });
    const languages: Record<string, any> = {};
    const langs = Object.keys(context);
    for (const key of langs) {
        if (key === "./index.ts") return;
        const lang = context[key].lang;
        const name = key.replace(/(\.\/languages\/|\.ts)/g, '');
        languages[name] = lang;
    }

    return languages;
}
const locale = localStorage.getItem('locale') || 'fr-fr';
export const i18n = createI18n({
    globalInjection: true,
    legacy: false,
    locale: locale,
    fallbackLocale: 'fr-fr',
    messages: loadLanguages()
});
export const i18nt = i18n.global.t;
export function setLanguage(locale: string) {
    i18n.global.locale = locale;
}