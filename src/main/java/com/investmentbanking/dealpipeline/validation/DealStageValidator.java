package com.investmentbanking.dealpipeline.validation;

import com.investmentbanking.dealpipeline.model.DealStage;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class DealStageValidator implements ConstraintValidator<ValidDealStage, DealStage> {
    
    @Override
    public void initialize(ValidDealStage constraintAnnotation) {
        // No initialization needed
    }
    
    @Override
    public boolean isValid(DealStage value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // Null values handled by @NotNull if required
        }
        
        // Check if value is a valid DealStage enum
        try {
            DealStage.valueOf(value.name());
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
