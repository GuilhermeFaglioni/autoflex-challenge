package com.autoflex.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record RawMaterialDTO(
                @NotBlank(message = "Material code is required") String code,

                @NotBlank(message = "Material name is required") String name,

                @NotNull(message = "Stock quantity is required") @PositiveOrZero(message = "Stock quantity cannot be negative") Integer stockQuantity) {
}
