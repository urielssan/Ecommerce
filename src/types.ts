// src/types.ts

// Esta interfaz define la forma exacta de los datos que vienen de tu Flask
export interface Product {
    idProductos: number;
    NombresProductos: string;
    Precio: number;
    descripcion: string;           // Corta
    descripcionProducto: string;   // Larga (HTML o texto largo)
    IngredientesSugeridos: string | null; // Nuevo campo solicitado
    marca: string | null;
    valor_propiedad_1: string | null;
    nombre_propiedad_1: string | null;
    tags: string | null;
    seo_descripcion: string | null;
    UrlImagen: string | null;
    nombre_categoria: string | null;
    nombre_subcategoria: string | null;
    fk_idSubcategoria: number;     // Útil para filtros internos
    idCategoria?: number;          // Útil para filtros
}
export interface Subcategory {
    idSubcategoria: number;
    nombre: string;
    imagen_url?: string; // Nuevo
}

export interface Category {
    idCategoria: number;
    nombre: string;
    imagen_url?: string; // Nuevo
    subcategorias: Subcategory[]; // <--- Nuevo array anidado
}



export interface CartItem extends Product {
    quantity: number;
}

export interface FamilyMember {
    dni: string;
    nombre: string;
    apellido: string;
    direccion: string;
    telefono: string;
    email: string;
    fecha_nacimiento: string; // Date string usually
    sexo: string;
    fecha_registro?: string;
}
