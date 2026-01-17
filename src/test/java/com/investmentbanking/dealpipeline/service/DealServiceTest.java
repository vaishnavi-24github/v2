package com.investmentbanking.dealpipeline.service;

import com.investmentbanking.dealpipeline.dto.*;
import com.investmentbanking.dealpipeline.exception.BadRequestException;
import com.investmentbanking.dealpipeline.exception.ResourceNotFoundException;
import com.investmentbanking.dealpipeline.exception.UnauthorizedException;
import com.investmentbanking.dealpipeline.model.Deal;
import com.investmentbanking.dealpipeline.model.DealStage;
import com.investmentbanking.dealpipeline.model.DealStatus;
import com.investmentbanking.dealpipeline.model.Note;
import com.investmentbanking.dealpipeline.model.Role;
import com.investmentbanking.dealpipeline.model.User;
import com.investmentbanking.dealpipeline.repository.DealRepository;
import com.investmentbanking.dealpipeline.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DealService Unit Tests")
class DealServiceTest {

    @Mock
    private DealRepository dealRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private DealService dealService;

    private User testUser;
    private User adminUser;
    private Deal testDeal;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id("user123")
                .username("testuser")
                .email("test@example.com")
                .password("encodedPassword")
                .firstName("Test")
                .lastName("User")
                .roles(new HashSet<>(Set.of(Role.USER)))
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        adminUser = User.builder()
                .id("admin123")
                .username("admin")
                .email("admin@example.com")
                .password("encodedPassword")
                .firstName("Admin")
                .lastName("User")
                .roles(new HashSet<>(Set.of(Role.ADMIN)))
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        testDeal = Deal.builder()
                .id("deal123")
                .dealName("Test Deal")
                .dealType("M&A")
                .clientName("Test Client")
                .sector("Technology")
                .summary("Test summary")
                .currentStage(DealStage.Prospect)
                .status(DealStatus.INITIATED)
                .currency("USD")
                .dealValue(new BigDecimal("1000000"))
                .createdBy("user123")
                .createdByUsername("testuser")
                .notes(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @DisplayName("Should successfully create deal as USER")
    void testCreateDeal_User_Success() {
        // Arrange
        DealRequest request = new DealRequest();
        request.setDealName("New Deal");
        request.setDealType("IPO");
        request.setClientName("New Client");
        request.setSector("Finance");
        request.setSummary("New deal summary");
        request.setCurrentStage(DealStage.Prospect);

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(dealRepository.save(any(Deal.class))).thenAnswer(invocation -> {
            Deal deal = invocation.getArgument(0);
            deal.setId("newdeal123");
            return deal;
        });

        // Act
        DealResponse response = dealService.createDeal(request);

        // Assert
        assertNotNull(response);
        assertEquals("newdeal123", response.getId());
        assertEquals("New Deal", response.getDealName());
        assertNull(response.getDealValue()); // USER cannot see dealValue

        verify(userRepository).findByUsername("testuser");
        verify(dealRepository).save(any(Deal.class));
    }

    @Test
    @DisplayName("Should successfully create deal as ADMIN with dealValue")
    void testCreateDeal_Admin_WithDealValue() {
        // Arrange
        DealRequest request = new DealRequest();
        request.setDealName("Admin Deal");
        request.setDealType("M&A");
        request.setClientName("Admin Client");
        request.setSector("Technology");
        request.setSummary("Admin deal summary");
        request.setCurrentStage(DealStage.Prospect);
        request.setDealValue(new BigDecimal("5000000"));

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("admin");
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        when(dealRepository.save(any(Deal.class))).thenAnswer(invocation -> {
            Deal deal = invocation.getArgument(0);
            deal.setId("admindeal123");
            return deal;
        });

        // Act
        DealResponse response = dealService.createDeal(request);

        // Assert
        assertNotNull(response);
        assertEquals("Admin Deal", response.getDealName());
        assertEquals(new BigDecimal("5000000"), response.getDealValue()); // ADMIN can see dealValue

        verify(userRepository).findByUsername("admin");
        verify(dealRepository).save(any(Deal.class));
    }

    @Test
    @DisplayName("Should throw UnauthorizedException when USER tries to set dealValue")
    void testCreateDeal_User_CannotSetDealValue() {
        // Arrange
        DealRequest request = new DealRequest();
        request.setDealName("New Deal");
        request.setDealType("M&A");
        request.setClientName("New Client");
        request.setSector("Technology");
        request.setSummary("New deal summary");
        request.setCurrentStage(DealStage.Prospect);
        request.setDealValue(new BigDecimal("1000000")); // USER trying to set dealValue

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () -> {
            dealService.createDeal(request);
        });

        assertEquals("Users cannot set dealValue. Only ADMIN can set deal value.", exception.getMessage());
        verify(userRepository).findByUsername("testuser");
        verify(dealRepository, never()).save(any(Deal.class));
    }

    @Test
    @DisplayName("Should throw UnauthorizedException when user not authenticated")
    void testCreateDeal_NotAuthenticated() {
        // Arrange
        DealRequest request = new DealRequest();
        when(securityContext.getAuthentication()).thenReturn(null);

        // Act & Assert
        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () -> {
            dealService.createDeal(request);
        });

        assertEquals("User not authenticated", exception.getMessage());
        verify(dealRepository, never()).save(any(Deal.class));
    }

    @Test
    @DisplayName("Should successfully get all deals for USER (only own deals)")
    void testGetAllDeals_User_OwnDeals() {
        // Arrange
        List<Deal> deals = new ArrayList<>();
        deals.add(testDeal);

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(dealRepository.findAll()).thenReturn(deals);

        // Act
        List<DealResponse> responses = dealService.getAllDeals(null, null, null);

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("deal123", responses.get(0).getId());
        assertNull(responses.get(0).getDealValue()); // USER cannot see dealValue

        verify(userRepository).findByUsername("testuser");
        verify(dealRepository).findAll();
    }

    @Test
    @DisplayName("Should successfully get all deals for ADMIN (all deals)")
    void testGetAllDeals_Admin_AllDeals() {
        // Arrange
        List<Deal> deals = new ArrayList<>();
        deals.add(testDeal);

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("admin");
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        when(dealRepository.findAll()).thenReturn(deals);

        // Act
        List<DealResponse> responses = dealService.getAllDeals(null, null, null);

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals(new BigDecimal("1000000"), responses.get(0).getDealValue()); // ADMIN can see dealValue

        verify(userRepository).findByUsername("admin");
        verify(dealRepository).findAll();
    }

    @Test
    @DisplayName("Should successfully filter deals by stage")
    void testGetAllDeals_WithStageFilter() {
        // Arrange
        List<Deal> deals = new ArrayList<>();
        deals.add(testDeal);

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("admin");
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        when(dealRepository.findByCurrentStage(DealStage.Prospect)).thenReturn(deals);

        // Act
        List<DealResponse> responses = dealService.getAllDeals(DealStage.Prospect, null, null);

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());
        verify(dealRepository).findByCurrentStage(DealStage.Prospect);
    }

    @Test
    @DisplayName("Should successfully get deal by ID for creator")
    void testGetDealById_Creator_Success() {
        // Arrange
        when(dealRepository.findById("deal123")).thenReturn(Optional.of(testDeal));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act
        DealResponse response = dealService.getDealById("deal123");

        // Assert
        assertNotNull(response);
        assertEquals("deal123", response.getId());
        assertEquals("Test Deal", response.getDealName());
        verify(dealRepository).findById("deal123");
    }

    @Test
    @DisplayName("Should successfully get deal by ID for ADMIN")
    void testGetDealById_Admin_Success() {
        // Arrange
        when(dealRepository.findById("deal123")).thenReturn(Optional.of(testDeal));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("admin");
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));

        // Act
        DealResponse response = dealService.getDealById("deal123");

        // Assert
        assertNotNull(response);
        assertEquals("deal123", response.getId());
        assertEquals(new BigDecimal("1000000"), response.getDealValue()); // ADMIN can see dealValue
        verify(dealRepository).findById("deal123");
    }

    @Test
    @DisplayName("Should throw UnauthorizedException when USER tries to access other user's deal")
    void testGetDealById_User_Unauthorized() {
        // Arrange
        Deal otherUserDeal = Deal.builder()
                .id("deal456")
                .dealName("Other Deal")
                .createdBy("otheruser123")
                .build();

        when(dealRepository.findById("deal456")).thenReturn(Optional.of(otherUserDeal));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () -> {
            dealService.getDealById("deal456");
        });

        assertEquals("You don't have permission to view this deal", exception.getMessage());
        verify(dealRepository).findById("deal456");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when deal not found")
    void testGetDealById_NotFound() {
        // Arrange
        when(dealRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            dealService.getDealById("nonexistent");
        });

        assertTrue(exception.getMessage().contains("Deal"));
        verify(dealRepository).findById("nonexistent");
    }

    @Test
    @DisplayName("Should successfully update deal as creator")
    void testUpdateDeal_Creator_Success() {
        // Arrange
        UpdateDealRequest request = new UpdateDealRequest();
        request.setSummary("Updated summary");
        request.setSector("Finance");

        when(dealRepository.findById("deal123")).thenReturn(Optional.of(testDeal));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(dealRepository.save(any(Deal.class))).thenReturn(testDeal);

        // Act
        DealResponse response = dealService.updateDeal("deal123", request);

        // Assert
        assertNotNull(response);
        verify(dealRepository).findById("deal123");
        verify(dealRepository).save(any(Deal.class));
    }

    @Test
    @DisplayName("Should throw UnauthorizedException when USER tries to update dealValue")
    void testUpdateDeal_User_CannotUpdateDealValue() {
        // Arrange
        UpdateDealRequest request = new UpdateDealRequest();
        request.setDealValue(new BigDecimal("2000000")); // USER trying to update dealValue

        when(dealRepository.findById("deal123")).thenReturn(Optional.of(testDeal));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () -> {
            dealService.updateDeal("deal123", request);
        });

        assertEquals("Users cannot update dealValue. Only ADMIN can update deal value.", exception.getMessage());
        verify(dealRepository).findById("deal123");
        verify(dealRepository, never()).save(any(Deal.class));
    }

    @Test
    @DisplayName("Should successfully update dealValue as ADMIN")
    void testUpdateDeal_Admin_CanUpdateDealValue() {
        // Arrange
        UpdateDealRequest request = new UpdateDealRequest();
        request.setDealValue(new BigDecimal("3000000"));

        when(dealRepository.findById("deal123")).thenReturn(Optional.of(testDeal));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("admin");
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        when(dealRepository.save(any(Deal.class))).thenReturn(testDeal);

        // Act
        DealResponse response = dealService.updateDeal("deal123", request);

        // Assert
        assertNotNull(response);
        verify(dealRepository).findById("deal123");
        verify(dealRepository).save(any(Deal.class));
    }

    @Test
    @DisplayName("Should successfully update deal stage")
    void testUpdateDealStage_Success() {
        // Arrange
        UpdateStageRequest request = new UpdateStageRequest();
        request.setStage(DealStage.UnderEvaluation);

        when(dealRepository.findById("deal123")).thenReturn(Optional.of(testDeal));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(dealRepository.save(any(Deal.class))).thenReturn(testDeal);

        // Act
        DealResponse response = dealService.updateDealStage("deal123", request);

        // Assert
        assertNotNull(response);
        verify(dealRepository).findById("deal123");
        verify(dealRepository).save(any(Deal.class));
    }

    @Test
    @DisplayName("Should set actualCloseDate when stage is CLOSED")
    void testUpdateDealStage_Closed_SetsCloseDate() {
        // Arrange
        UpdateStageRequest request = new UpdateStageRequest();
        request.setStage(DealStage.Closed);

        when(dealRepository.findById("deal123")).thenReturn(Optional.of(testDeal));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(dealRepository.save(any(Deal.class))).thenAnswer(invocation -> {
            Deal deal = invocation.getArgument(0);
            return deal;
        });

        // Act
        DealResponse response = dealService.updateDealStage("deal123", request);

        // Assert
        assertNotNull(response);
        verify(dealRepository).save(argThat(deal -> 
            deal.getCurrentStage() == DealStage.Closed && 
            deal.getActualCloseDate() != null &&
            deal.getStatus() == DealStatus.CLOSED
        ));
    }

    @Test
    @DisplayName("Should successfully update deal value as ADMIN")
    void testUpdateDealValue_Admin_Success() {
        // Arrange
        UpdateValueRequest request = new UpdateValueRequest();
        request.setDealValue(new BigDecimal("5000000"));

        when(dealRepository.findById("deal123")).thenReturn(Optional.of(testDeal));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("admin");
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        when(dealRepository.save(any(Deal.class))).thenReturn(testDeal);

        // Act
        DealResponse response = dealService.updateDealValue("deal123", request);

        // Assert
        assertNotNull(response);
        verify(dealRepository).findById("deal123");
        verify(dealRepository).save(any(Deal.class));
    }

    @Test
    @DisplayName("Should throw UnauthorizedException when USER tries to update deal value")
    void testUpdateDealValue_User_Unauthorized() {
        // Arrange
        UpdateValueRequest request = new UpdateValueRequest();
        request.setDealValue(new BigDecimal("5000000"));

        when(dealRepository.findById("deal123")).thenReturn(Optional.of(testDeal));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () -> {
            dealService.updateDealValue("deal123", request);
        });

        assertEquals("Only ADMIN can update deal value", exception.getMessage());
        verify(dealRepository).findById("deal123");
        verify(dealRepository, never()).save(any(Deal.class));
    }

    @Test
    @DisplayName("Should successfully add note to deal")
    void testAddNoteToDeal_Success() {
        // Arrange
        AddNoteRequest request = new AddNoteRequest();
        request.setNoteText("This is a test note");

        when(dealRepository.findById("deal123")).thenReturn(Optional.of(testDeal));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(dealRepository.save(any(Deal.class))).thenAnswer(invocation -> {
            Deal deal = invocation.getArgument(0);
            return deal;
        });

        // Act
        DealResponse response = dealService.addNoteToDeal("deal123", request);

        // Assert
        assertNotNull(response);
        verify(dealRepository).findById("deal123");
        verify(dealRepository).save(argThat(deal -> 
            deal.getNotes() != null && 
            deal.getNotes().size() == 1 &&
            deal.getNotes().get(0).getNoteText().equals("This is a test note")
        ));
    }

    @Test
    @DisplayName("Should throw UnauthorizedException when USER tries to add note to other user's deal")
    void testAddNoteToDeal_User_Unauthorized() {
        // Arrange
        Deal otherUserDeal = Deal.builder()
                .id("deal456")
                .createdBy("otheruser123")
                .notes(new ArrayList<>())
                .build();

        AddNoteRequest request = new AddNoteRequest();
        request.setNoteText("Test note");

        when(dealRepository.findById("deal456")).thenReturn(Optional.of(otherUserDeal));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () -> {
            dealService.addNoteToDeal("deal456", request);
        });

        assertEquals("You don't have permission to add notes to this deal", exception.getMessage());
        verify(dealRepository).findById("deal456");
        verify(dealRepository, never()).save(any(Deal.class));
    }

    @Test
    @DisplayName("Should successfully delete deal as ADMIN")
    void testDeleteDeal_Admin_Success() {
        // Arrange
        when(dealRepository.findById("deal123")).thenReturn(Optional.of(testDeal));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("admin");
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
        doNothing().when(dealRepository).delete(testDeal);

        // Act
        assertDoesNotThrow(() -> dealService.deleteDeal("deal123"));

        // Assert
        verify(dealRepository).findById("deal123");
        verify(dealRepository).delete(testDeal);
    }

    @Test
    @DisplayName("Should throw UnauthorizedException when USER tries to delete deal")
    void testDeleteDeal_User_Unauthorized() {
        // Arrange
        when(dealRepository.findById("deal123")).thenReturn(Optional.of(testDeal));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () -> {
            dealService.deleteDeal("deal123");
        });

        assertEquals("Only ADMIN can delete deals", exception.getMessage());
        verify(dealRepository).findById("deal123");
        verify(dealRepository, never()).delete(any(Deal.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when deleting non-existent deal")
    void testDeleteDeal_NotFound() {
        // Arrange
        when(dealRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            dealService.deleteDeal("nonexistent");
        });

        assertTrue(exception.getMessage().contains("Deal"));
        verify(dealRepository).findById("nonexistent");
        verify(dealRepository, never()).delete(any(Deal.class));
    }
}
