import { createI18n } from "vue-i18n";

export function loadLanguages() {
    const context = import.meta.globEager("./languages/*.ts");
    const languages: Record<string, any> = {};
    let langs = Object.keys(context);
    for (let key of langs) {
        if (key === "./index.ts") return;
        let lang = context[key].lang;
        let name = key.replace(/(\.\/languages\/|\.ts)/g, '');
        languages[name] = lang;
    }

    return languages;
}
const locale = localStorage.getItem('locale') || 'fr-fr';
export const i18n = createI18n({
    // globalInjection: true,
    // legacy: false,
    locale: locale,
    fallbackLocale: 'fr-fr',
    messages: loadLanguages()
});
export const i18nt = i18n.global.t;
export function setLanguage(locale: string) {
    i18n.global.locale = locale;
}