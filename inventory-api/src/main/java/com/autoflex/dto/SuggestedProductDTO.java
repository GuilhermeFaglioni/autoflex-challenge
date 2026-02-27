package com.autoflex.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record SuggestedProductDTO(
        @NotNull(message = "Product ID is required") Long id,

        @NotBlank(message = "Product code is required") String productCode,

        @NotBlank(message = "Product name is required") String productName,

        @NotNull(message = "Suggested quantity is required") @PositiveOrZero(message = "Suggested quantity must be zero or positive") Integer suggestedQuantity,

        @NotNull(message = "Subtotal value is required") @PositiveOrZero(message = "Subtotal value must be zero or positive") BigDecimal subtotalValue) {

}
