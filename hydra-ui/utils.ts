export const generateId = () =>
    Date.now().toString(36) + Math.random().toString(36).substring(2);

export const cleanHtml = (raw: string): string => {
    let html = raw.trim();
    if (html.startsWith('```html')) html = html.substring(7).trimStart();
    if (html.startsWith('```')) html = html.substring(3).trimStart();
    if (html.endsWith('```')) html = html.substring(0, html.length - 3).trimEnd();
    return html;
};
