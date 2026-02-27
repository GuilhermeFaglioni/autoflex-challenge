package com.autoflex.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.List;

public record ProductionSuggestionResponseDTO(
        @NotNull(message = "Suggestions list is required") List<@Valid SuggestedProductDTO> suggestions,

        @NotNull(message = "Total expected value is required") @PositiveOrZero(message = "Total expected value must be zero or positive") BigDecimal totalExpectedValue) {

}
