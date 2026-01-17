package com.investmentbanking.dealpipeline.dto;

import com.investmentbanking.dealpipeline.model.DealStage;
import com.investmentbanking.dealpipeline.model.DealStatus;
import com.investmentbanking.dealpipeline.validation.ValidDealStage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DealRequest {
    
    @NotBlank(message = "Deal name is required")
    private String dealName;
    
    @NotBlank(message = "Deal type is required")
    private String dealType;
    
    private DealStatus status;
    
    @NotBlank(message = "Client name is required")
    private String clientName;
    
    @Positive(message = "Deal value must be positive")
    private BigDecimal dealValue; // Optional - USER cannot set, ADMIN only
    
    private String currency = "USD";
    
    private String description;
    
    @NotBlank(message = "Summary is required")
    private String summary;
    
    @NotBlank(message = "Sector is required")
    private String sector;
    
    @NotNull(message = "Current stage is required")
    @ValidDealStage
    private DealStage currentStage;
    
    private String assignedTo;
    
    private List<String> tags;
    
    private LocalDateTime expectedCloseDate;
}
