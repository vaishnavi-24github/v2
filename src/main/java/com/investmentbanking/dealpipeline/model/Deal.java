package com.investmentbanking.dealpipeline.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "deals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Deal {
    
    @Id
    private String id;
    
    @Indexed
    @Field("dealName")
    private String dealName;
    
    @Field("dealType")
    private String dealType; // M&A, IPO, Debt, Equity, etc.
    
    @Field("status")
    private DealStatus status;
    
    @Field("currentStage")
    private DealStage currentStage;
    
    @Field("clientName")
    private String clientName;
    
    @Field("dealValue")
    private BigDecimal dealValue; // ADMIN ONLY - sensitive field
    
    @Field("currency")
    private String currency; // USD, EUR, GBP, etc.
    
    @Field("description")
    private String description;
    
    @Field("summary")
    private String summary;
    
    @Field("sector")
    private String sector;
    
    @Field("assignedTo")
    private String assignedTo; // User ID
    
    @Field("assignedToUsername")
    private String assignedToUsername;
    
    @Field("createdBy")
    private String createdBy; // User ID
    
    @Field("createdByUsername")
    private String createdByUsername;
    
    @Field("tags")
    private List<String> tags;
    
    @Field("notes")
    private List<Note> notes = new ArrayList<>();
    
    @Field("expectedCloseDate")
    private LocalDateTime expectedCloseDate;
    
    @Field("actualCloseDate")
    private LocalDateTime actualCloseDate;
    
    @Field("createdAt")
    private LocalDateTime createdAt;
    
    @Field("updatedAt")
    private LocalDateTime updatedAt;
}
