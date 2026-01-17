package com.investmentbanking.dealpipeline.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = DealStageValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidDealStage {
    String message() default "Invalid deal stage. Valid values: Prospect, UnderEvaluation, TermSheetSubmitted, Closed, Lost";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
