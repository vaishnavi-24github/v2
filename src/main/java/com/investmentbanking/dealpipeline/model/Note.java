package com.investmentbanking.dealpipeline.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Note {
    
    @Field("userId")
    private String userId;
    
    @Field("username")
    private String username;
    
    @Field("noteText")
    private String noteText;
    
    @Field("timestamp")
    private LocalDateTime timestamp;
}
