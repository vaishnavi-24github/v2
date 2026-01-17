package com.investmentbanking.dealpipeline.dto;

import com.investmentbanking.dealpipeline.model.DealStage;
import com.investmentbanking.dealpipeline.model.DealStatus;
import com.investmentbanking.dealpipeline.model.Note;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DealResponse {
    private String id;
    private String dealName;
    private String dealType;
    private DealStatus status;
    private DealStage currentStage;
    private String clientName;
    private BigDecimal dealValue; // ADMIN only - sensitive
    private String currency;
    private String description;
    private String summary;
    private String sector;
    private String assignedTo;
    private String assignedToUsername;
    private String createdBy;
    private String createdByUsername;
    private List<String> tags;
    private List<Note> notes;
    private LocalDateTime expectedCloseDate;
    private LocalDateTime actualCloseDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
