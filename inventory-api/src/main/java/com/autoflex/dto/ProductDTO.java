package com.autoflex.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.List;

public record ProductDTO(
                @NotBlank(message = "Product code is required") String code,

                @NotBlank(message = "Product name is required") String name,

                @NotNull(message = "Price is required") @PositiveOrZero(message = "Price must be zero or positive") BigDecimal price,

                List<@Valid ProductRawMaterialDTO> materials) {
}
