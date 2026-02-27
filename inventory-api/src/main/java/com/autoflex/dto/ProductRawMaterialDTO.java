package com.autoflex.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ProductRawMaterialDTO(
                @NotBlank(message = "Raw material code is required") String rawMaterialCode,

                @NotNull(message = "Quantity needed is required") @Positive(message = "Quantity needed must be greater than zero") Integer quantityNeeded) {
}
