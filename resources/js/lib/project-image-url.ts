export function projectImageUrl(image: string | null): string | null {
    if (!image) {
        return null;
    }

    const path = image.replace(/^\/+/, '');

    if (path.startsWith('storage/')) {
        return `/${path}`;
    }

    return path.startsWith('projects/') ? `/storage/${path}` : `/${path}`;
}
