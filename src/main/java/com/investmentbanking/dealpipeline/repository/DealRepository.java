package com.investmentbanking.dealpipeline.repository;

import com.investmentbanking.dealpipeline.model.Deal;
import com.investmentbanking.dealpipeline.model.DealStage;
import com.investmentbanking.dealpipeline.model.DealStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DealRepository extends MongoRepository<Deal, String> {
    List<Deal> findByStatus(DealStatus status);
    List<Deal> findByCurrentStage(DealStage currentStage);
    List<Deal> findByAssignedTo(String assignedTo);
    List<Deal> findByCreatedBy(String createdBy);
    List<Deal> findByDealType(String dealType);
    List<Deal> findBySector(String sector);
    
    @Query("{ 'currentStage': ?0, 'sector': ?1, 'dealType': ?2 }")
    List<Deal> findByStageAndSectorAndDealType(DealStage stage, String sector, String dealType);
    
    @Query("{ 'currentStage': ?0, 'sector': ?1 }")
    List<Deal> findByStageAndSector(DealStage stage, String sector);
    
    @Query("{ 'currentStage': ?0, 'dealType': ?1 }")
    List<Deal> findByStageAndDealType(DealStage stage, String dealType);
    
    @Query("{ 'sector': ?0, 'dealType': ?1 }")
    List<Deal> findBySectorAndDealType(String sector, String dealType);
    
    @Query("{ 'dealName': { $regex: ?0, $options: 'i' } }")
    List<Deal> findByDealNameContaining(String dealName);
    
    @Query("{ 'clientName': { $regex: ?0, $options: 'i' } }")
    List<Deal> findByClientNameContaining(String clientName);
    
    Optional<Deal> findByIdAndCreatedBy(String id, String createdBy);
}
