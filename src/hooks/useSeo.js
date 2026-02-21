import { useEffect } from 'react';

export const useSeo = ({ title, description, url, imageUrl }) => {
    useEffect(() => {
        const defaultTitle = 'Weeblogs — Curated Indian Blog Platform';
        const pageTitle = title ? `${title} | Weeblogs` : defaultTitle;
        document.title = pageTitle;

        const updateMeta = (name, content, isProperty = false) => {
            if (!content) return;
            const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
            let el = document.querySelector(selector);
            if (!el) {
                el = document.createElement('meta');
                if (isProperty) el.setAttribute('property', name);
                else el.setAttribute('name', name);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        if (description) {
            updateMeta('description', description);
            updateMeta('og:description', description, true);
        }
        if (title) {
            updateMeta('og:title', title, true);
        }
        if (url) {
            updateMeta('og:url', url, true);
        }
        if (imageUrl) {
            updateMeta('og:image', imageUrl, true);
        }
    }, [title, description, url, imageUrl]);
};
