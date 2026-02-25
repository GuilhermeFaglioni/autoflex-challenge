package com.autoflex.dto;

import java.math.BigDecimal;
import java.util.List;

public record ProductDTO(
        String code,
        String name,
        BigDecimal price,
        List<ProductRawMaterialDTO> materials) {
}
