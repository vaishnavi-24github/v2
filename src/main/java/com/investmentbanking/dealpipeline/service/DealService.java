package com.investmentbanking.dealpipeline.service;

import com.investmentbanking.dealpipeline.dto.*;
import com.investmentbanking.dealpipeline.exception.BadRequestException;
import com.investmentbanking.dealpipeline.exception.ResourceNotFoundException;
import com.investmentbanking.dealpipeline.exception.UnauthorizedException;
import com.investmentbanking.dealpipeline.model.Deal;
import com.investmentbanking.dealpipeline.model.DealStage;
import com.investmentbanking.dealpipeline.model.Note;
import com.investmentbanking.dealpipeline.model.Role;
import com.investmentbanking.dealpipeline.model.User;
import com.investmentbanking.dealpipeline.repository.DealRepository;
import com.investmentbanking.dealpipeline.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DealService {
    
    private final DealRepository dealRepository;
    private final UserRepository userRepository;
    
    /**
     * Create a new deal
     * USER cannot set dealValue
     * ADMIN can set dealValue
     */
    @Transactional
    public DealResponse createDeal(DealRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }
        
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        
        // Check if USER is trying to set dealValue (not allowed)
        boolean isUser = user.getRoles().stream().noneMatch(role -> role == Role.ADMIN);
        if (isUser && request.getDealValue() != null) {
            throw new UnauthorizedException("Users cannot set dealValue. Only ADMIN can set deal value.");
        }
        
        Deal deal = Deal.builder()
                .dealName(request.getDealName())
                .dealType(request.getDealType())
                .status(request.getStatus() != null ? request.getStatus() : com.investmentbanking.dealpipeline.model.DealStatus.INITIATED)
                .currentStage(request.getCurrentStage())
                .clientName(request.getClientName())
                .dealValue(request.getDealValue()) // Only ADMIN can set this
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .description(request.getDescription())
                .summary(request.getSummary())
                .sector(request.getSector())
                .assignedTo(user.getId())
                .assignedToUsername(user.getUsername())
                .createdBy(user.getId())
                .createdByUsername(user.getUsername())
                .tags(request.getTags())
                .expectedCloseDate(request.getExpectedCloseDate())
                .notes(new java.util.ArrayList<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        deal = dealRepository.save(deal);
        return mapToDealResponse(deal, user);
    }
    
    /**
     * Get all deals with optional filters
     * USER sees only their own deals
     * ADMIN sees all deals
     */
    @Transactional(readOnly = true)
    public List<DealResponse> getAllDeals(DealStage stage, String sector, String dealType) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }
        
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        
        boolean isAdmin = user.getRoles().stream().anyMatch(role -> role == Role.ADMIN);
        
        List<Deal> deals;
        
        if (isAdmin) {
            // ADMIN sees all deals
            if (stage != null && sector != null && dealType != null) {
                deals = dealRepository.findByStageAndSectorAndDealType(stage, sector, dealType);
            } else if (stage != null && sector != null) {
                deals = dealRepository.findByStageAndSector(stage, sector);
            } else if (stage != null && dealType != null) {
                deals = dealRepository.findByStageAndDealType(stage, dealType);
            } else if (sector != null && dealType != null) {
                deals = dealRepository.findBySectorAndDealType(sector, dealType);
            } else if (stage != null) {
                deals = dealRepository.findByCurrentStage(stage);
            } else if (sector != null) {
                deals = dealRepository.findBySector(sector);
            } else if (dealType != null) {
                deals = dealRepository.findByDealType(dealType);
            } else {
                deals = dealRepository.findAll();
            }
        } else {
            // USER sees only their own deals
            if (stage != null && sector != null && dealType != null) {
                deals = dealRepository.findByStageAndSectorAndDealType(stage, sector, dealType)
                        .stream()
                        .filter(deal -> deal.getCreatedBy().equals(user.getId()))
                        .collect(Collectors.toList());
            } else if (stage != null && sector != null) {
                deals = dealRepository.findByStageAndSector(stage, sector)
                        .stream()
                        .filter(deal -> deal.getCreatedBy().equals(user.getId()))
                        .collect(Collectors.toList());
            } else if (stage != null && dealType != null) {
                deals = dealRepository.findByStageAndDealType(stage, dealType)
                        .stream()
                        .filter(deal -> deal.getCreatedBy().equals(user.getId()))
                        .collect(Collectors.toList());
            } else if (sector != null && dealType != null) {
                deals = dealRepository.findBySectorAndDealType(sector, dealType)
                        .stream()
                        .filter(deal -> deal.getCreatedBy().equals(user.getId()))
                        .collect(Collectors.toList());
            } else if (stage != null) {
                deals = dealRepository.findByCurrentStage(stage)
                        .stream()
                        .filter(deal -> deal.getCreatedBy().equals(user.getId()))
                        .collect(Collectors.toList());
            } else if (sector != null) {
                deals = dealRepository.findBySector(sector)
                        .stream()
                        .filter(deal -> deal.getCreatedBy().equals(user.getId()))
                        .collect(Collectors.toList());
            } else if (dealType != null) {
                deals = dealRepository.findByDealType(dealType)
                        .stream()
                        .filter(deal -> deal.getCreatedBy().equals(user.getId()))
                        .collect(Collectors.toList());
            } else {
                deals = dealRepository.findByCreatedBy(user.getId());
            }
        }
        
        return deals.stream()
                .map(deal -> mapToDealResponse(deal, user))
                .collect(Collectors.toList());
    }
    
    /**
     * Get deal by ID
     * USER can only see their own deals
     * ADMIN can see any deal
     */
    @Transactional(readOnly = true)
    public DealResponse getDealById(String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }
        
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        
        Deal deal = dealRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deal", "id", id));
        
        boolean isAdmin = user.getRoles().stream().anyMatch(role -> role == Role.ADMIN);
        
        // USER can only see their own deals
        if (!isAdmin && !deal.getCreatedBy().equals(user.getId())) {
            throw new UnauthorizedException("You can only view your own deals");
        }
        
        return mapToDealResponse(deal, user);
    }
    
    /**
     * Update deal
     * USER cannot update dealValue
     * ADMIN can update dealValue
     */
    @Transactional
    public DealResponse updateDeal(String id, UpdateDealRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }
        
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        
        Deal deal = dealRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deal", "id", id));
        
        boolean isAdmin = user.getRoles().stream().anyMatch(role -> role == Role.ADMIN);
        
        // USER can only update their own deals
        if (!isAdmin && !deal.getCreatedBy().equals(user.getId())) {
            throw new UnauthorizedException("You can only update your own deals");
        }
        
        // Check if USER is trying to update dealValue (not allowed)
        if (!isAdmin && request.getDealValue() != null) {
            throw new UnauthorizedException("Users cannot update dealValue. Only ADMIN can update deal value.");
        }
        
        // Update fields
        if (request.getDealName() != null) {
            deal.setDealName(request.getDealName());
        }
        if (request.getDealType() != null) {
            deal.setDealType(request.getDealType());
        }
        if (request.getStatus() != null) {
            deal.setStatus(request.getStatus());
        }
        if (request.getClientName() != null) {
            deal.setClientName(request.getClientName());
        }
        if (request.getDealValue() != null && isAdmin) {
            deal.setDealValue(request.getDealValue());
        }
        if (request.getCurrency() != null) {
            deal.setCurrency(request.getCurrency());
        }
        if (request.getDescription() != null) {
            deal.setDescription(request.getDescription());
        }
        if (request.getSummary() != null) {
            deal.setSummary(request.getSummary());
        }
        if (request.getSector() != null) {
            deal.setSector(request.getSector());
        }
        if (request.getCurrentStage() != null) {
            deal.setCurrentStage(request.getCurrentStage());
        }
        if (request.getAssignedTo() != null) {
            deal.setAssignedTo(request.getAssignedTo());
        }
        if (request.getTags() != null) {
            deal.setTags(request.getTags());
        }
        if (request.getExpectedCloseDate() != null) {
            deal.setExpectedCloseDate(request.getExpectedCloseDate());
        }
        
        deal.setUpdatedAt(LocalDateTime.now());
        
        deal = dealRepository.save(deal);
        return mapToDealResponse(deal, user);
    }
    
    /**
     * Update deal stage
     * USER can only update their own deals
     * ADMIN can update any deal
     */
    @Transactional
    public DealResponse updateDealStage(String id, UpdateStageRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }
        
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        
        Deal deal = dealRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deal", "id", id));
        
        boolean isAdmin = user.getRoles().stream().anyMatch(role -> role == Role.ADMIN);
        
        // USER can only update their own deals
        if (!isAdmin && !deal.getCreatedBy().equals(user.getId())) {
            throw new UnauthorizedException("You can only update your own deals");
        }
        
        deal.setCurrentStage(request.getStage());
        deal.setUpdatedAt(LocalDateTime.now());
        
        deal = dealRepository.save(deal);
        return mapToDealResponse(deal, user);
    }
    
    /**
     * Update deal value
     * ADMIN only
     */
    @Transactional
    public DealResponse updateDealValue(String id, UpdateValueRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }
        
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        
        boolean isAdmin = user.getRoles().stream().anyMatch(role -> role == Role.ADMIN);
        if (!isAdmin) {
            throw new UnauthorizedException("Only ADMIN can update deal value");
        }
        
        Deal deal = dealRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deal", "id", id));
        
        deal.setDealValue(request.getDealValue());
        deal.setUpdatedAt(LocalDateTime.now());
        
        deal = dealRepository.save(deal);
        return mapToDealResponse(deal, user);
    }
    
    /**
     * Add note to deal
     * USER can add notes to their own deals
     * ADMIN can add notes to any deal
     */
    @Transactional
    public DealResponse addNoteToDeal(String id, AddNoteRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }
        
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        
        Deal deal = dealRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deal", "id", id));
        
        boolean isAdmin = user.getRoles().stream().anyMatch(role -> role == Role.ADMIN);
        
        // USER can only add notes to their own deals
        if (!isAdmin && !deal.getCreatedBy().equals(user.getId())) {
            throw new UnauthorizedException("You can only add notes to your own deals");
        }
        
        Note note = Note.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .noteText(request.getNoteText())
                .timestamp(LocalDateTime.now())
                .build();
        
        if (deal.getNotes() == null) {
            deal.setNotes(new java.util.ArrayList<>());
        }
        deal.getNotes().add(note);
        deal.setUpdatedAt(LocalDateTime.now());
        
        deal = dealRepository.save(deal);
        return mapToDealResponse(deal, user);
    }
    
    /**
     * Delete deal
     * ADMIN only
     */
    @Transactional
    public void deleteDeal(String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }
        
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        
        boolean isAdmin = user.getRoles().stream().anyMatch(role -> role == Role.ADMIN);
        if (!isAdmin) {
            throw new UnauthorizedException("Only ADMIN can delete deals");
        }
        
        Deal deal = dealRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deal", "id", id));
        
        dealRepository.delete(deal);
    }
    
    /**
     * Map Deal entity to DealResponse
     * Hide dealValue for USER role
     */
    private DealResponse mapToDealResponse(Deal deal, User user) {
        boolean isAdmin = user.getRoles().stream().anyMatch(role -> role == Role.ADMIN);
        
        DealResponse.DealResponseBuilder builder = DealResponse.builder()
                .id(deal.getId())
                .dealName(deal.getDealName())
                .dealType(deal.getDealType())
                .status(deal.getStatus())
                .currentStage(deal.getCurrentStage())
                .clientName(deal.getClientName())
                .currency(deal.getCurrency())
                .description(deal.getDescription())
                .summary(deal.getSummary())
                .sector(deal.getSector())
                .assignedTo(deal.getAssignedTo())
                .assignedToUsername(deal.getAssignedToUsername())
                .createdBy(deal.getCreatedBy())
                .createdByUsername(deal.getCreatedByUsername())
                .tags(deal.getTags())
                .notes(deal.getNotes())
                .expectedCloseDate(deal.getExpectedCloseDate())
                .actualCloseDate(deal.getActualCloseDate())
                .createdAt(deal.getCreatedAt())
                .updatedAt(deal.getUpdatedAt());
        
        // Only ADMIN can see dealValue
        if (isAdmin) {
            builder.dealValue(deal.getDealValue());
        } else {
            builder.dealValue(null); // Hide dealValue for USER
        }
        
        return builder.build();
    }
}
