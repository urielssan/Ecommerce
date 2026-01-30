
export const getGoogleDriveDirectLink = (url: string | null | undefined): string | undefined => {
    if (!url) return undefined;

    // Si ya es un enlace directo o no es de Google Drive, lo devolvemos tal cual
    if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) {
        return url;
    }

    // Intento 1: Extraer ID de /file/d/......./view
    const matchId = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (matchId && matchId[1]) {
        // Opción A: uc?export=view&id=...
        // return `https://drive.google.com/uc?export=view&id=${matchId[1]}`;
        // Opción B: lh3.googleusercontent.com/d/... (Suele ser más rápido para imágenes)
        return `https://lh3.googleusercontent.com/d/${matchId[1]}`;
    }

    // Intento 2: Extraer de id=.......
    const matchIdParam = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (matchIdParam && matchIdParam[1]) {
        return `https://lh3.googleusercontent.com/d/${matchIdParam[1]}`;
    }

    return url;
};
