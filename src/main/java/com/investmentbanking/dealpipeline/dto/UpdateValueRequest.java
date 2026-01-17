package com.investmentbanking.dealpipeline.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateValueRequest {
    
    @NotNull(message = "Deal value is required")
    @Positive(message = "Deal value must be positive")
    private BigDecimal dealValue;
}
