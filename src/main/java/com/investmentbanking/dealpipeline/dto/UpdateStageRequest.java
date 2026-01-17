package com.investmentbanking.dealpipeline.dto;

import com.investmentbanking.dealpipeline.model.DealStage;
import com.investmentbanking.dealpipeline.validation.ValidDealStage;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStageRequest {
    
    @NotNull(message = "Stage is required")
    @ValidDealStage
    private DealStage stage;
}
