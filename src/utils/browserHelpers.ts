export const NUSUK_URLS = {
    LOGIN: 'https://masar.nusuk.sa/pub/login',
    DASHBOARD: 'https://masar.nusuk.sa/',
    PERMITS: 'https://masar.nusuk.sa/app/permit/list'
};

export const openNusukPage = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
};

export const openNusukLogin = () => openNusukPage(NUSUK_URLS.LOGIN);
