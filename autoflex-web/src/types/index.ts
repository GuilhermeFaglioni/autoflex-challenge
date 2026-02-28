export interface RawMaterial {
    id: number;
    code: string;
    name: string;
    stockQuantity: number;
}

export interface ProductMaterial {
    id: number;
    rawMaterial: RawMaterial;
    quantityNeeded: number;
}

export interface Product {
    id: number;
    code: string;
    name: string;
    price: number;
    materials: ProductMaterial[];
}

export interface RawMaterialRequestDTO {
    code: string;
    name: string;
    stockQuantity: number;
}

export interface ProductRequestDTO {
    code: string;
    name: string;
    price: number;
}

export interface ProductMaterialRequestDTO {
    rawMaterialCode: string;
    quantityNeeded: number;
}

export interface SuggestedProductDTO {
    productId: number;
    productCode: string;
    productName: string;
    suggestedQuantity: number;
    subtotalValue: number;
}

export interface ProductionSuggestionResponseDTO {
    suggestions: SuggestedProductDTO[];
    totalExpectedValue: number;
}