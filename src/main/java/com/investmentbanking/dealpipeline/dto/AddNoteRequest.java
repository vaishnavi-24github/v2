package com.investmentbanking.dealpipeline.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddNoteRequest {
    
    @NotBlank(message = "Note text is required")
    @Size(max = 500, message = "Note text must not exceed 500 characters")
    private String noteText;
}
