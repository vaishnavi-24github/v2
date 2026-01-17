package com.investmentbanking.dealpipeline.dto;

import com.investmentbanking.dealpipeline.model.DealStage;
import com.investmentbanking.dealpipeline.model.DealStatus;
import com.investmentbanking.dealpipeline.validation.ValidDealStage;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDealRequest {
    
    // All fields optional for partial updates
    @Size(min = 1, max = 200, message = "Deal name must be between 1 and 200 characters")
    private String dealName;
    
    @Size(min = 1, max = 100, message = "Deal type must be between 1 and 100 characters")
    private String dealType;
    
    private DealStatus status;
    
    @Size(min = 1, max = 200, message = "Client name must be between 1 and 200 characters")
    private String clientName;
    
    @Positive(message = "Deal value must be positive")
    private BigDecimal dealValue; // Optional - USER cannot set, ADMIN only
    
    @Size(max = 10, message = "Currency code must not exceed 10 characters")
    private String currency;
    
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;
    
    @Size(max = 1000, message = "Summary must not exceed 1000 characters")
    private String summary;
    
    @Size(min = 1, max = 100, message = "Sector must be between 1 and 100 characters")
    private String sector;
    
    @ValidDealStage
    private DealStage currentStage;
    
    private String assignedTo;
    
    private List<String> tags;
    
    private LocalDateTime expectedCloseDate;
}
