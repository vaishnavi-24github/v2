package com.investmentbanking.dealpipeline.controller;

import com.investmentbanking.dealpipeline.dto.*;
import com.investmentbanking.dealpipeline.model.DealStage;
import com.investmentbanking.dealpipeline.service.DealService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deals")
@RequiredArgsConstructor
public class DealController {
    
    private final DealService dealService;
    
    /**
     * POST /api/deals - Create new deal
     * USER and ADMIN can create
     * USER cannot set dealValue
     */
    @PostMapping
    public ResponseEntity<ApiResponse<DealResponse>> createDeal(@Valid @RequestBody DealRequest request) {
        DealResponse response = dealService.createDeal(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Deal created successfully", response));
    }
    
    /**
     * GET /api/deals - List all deals
     * USER and ADMIN can access
     * Optional filters: stage, sector, dealType
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DealResponse>>> getAllDeals(
            @RequestParam(required = false) DealStage stage,
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String dealType) {
        List<DealResponse> deals = dealService.getAllDeals(stage, sector, dealType);
        return ResponseEntity.ok(ApiResponse.success(deals));
    }
    
    /**
     * GET /api/deals/{id} - Get deal details
     * USER and ADMIN can access
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DealResponse>> getDealById(@PathVariable String id) {
        DealResponse response = dealService.getDealById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    /**
     * PUT /api/deals/{id} - Update deal
     * USER and ADMIN can update
     * USER cannot update dealValue
     * Can update: summary, sector, dealType
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DealResponse>> updateDeal(
            @PathVariable String id,
            @Valid @RequestBody UpdateDealRequest request) {
        DealResponse response = dealService.updateDeal(id, request);
        return ResponseEntity.ok(ApiResponse.success("Deal updated successfully", response));
    }
    
    /**
     * PATCH /api/deals/{id}/stage - Update deal stage
     * USER and ADMIN can update
     * Validates enum values
     */
    @PatchMapping("/{id}/stage")
    public ResponseEntity<ApiResponse<DealResponse>> updateDealStage(
            @PathVariable String id,
            @Valid @RequestBody UpdateStageRequest request) {
        DealResponse response = dealService.updateDealStage(id, request);
        return ResponseEntity.ok(ApiResponse.success("Deal stage updated successfully", response));
    }
    
    /**
     * PATCH /api/deals/{id}/value - Update dealValue
     * ADMIN only
     */
    @PatchMapping("/{id}/value")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DealResponse>> updateDealValue(
            @PathVariable String id,
            @Valid @RequestBody UpdateValueRequest request) {
        DealResponse response = dealService.updateDealValue(id, request);
        return ResponseEntity.ok(ApiResponse.success("Deal value updated successfully", response));
    }
    
    /**
     * POST /api/deals/{id}/notes - Add note to deal
     * USER and ADMIN can add notes
     */
    @PostMapping("/{id}/notes")
    public ResponseEntity<ApiResponse<DealResponse>> addNoteToDeal(
            @PathVariable String id,
            @Valid @RequestBody AddNoteRequest request) {
        DealResponse response = dealService.addNoteToDeal(id, request);
        return ResponseEntity.ok(ApiResponse.success("Note added successfully", response));
    }
    
    /**
     * DELETE /api/deals/{id} - Delete deal
     * ADMIN only
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> deleteDeal(@PathVariable String id) {
        dealService.deleteDeal(id);
        return ResponseEntity.ok(ApiResponse.success("Deal deleted successfully", null));
    }
}
