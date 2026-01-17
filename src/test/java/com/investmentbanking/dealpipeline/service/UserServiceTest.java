package com.investmentbanking.dealpipeline.service;

import com.investmentbanking.dealpipeline.dto.CreateUserRequest;
import com.investmentbanking.dealpipeline.dto.UpdateUserStatusRequest;
import com.investmentbanking.dealpipeline.dto.UserProfileResponse;
import com.investmentbanking.dealpipeline.exception.BadRequestException;
import com.investmentbanking.dealpipeline.exception.ResourceNotFoundException;
import com.investmentbanking.dealpipeline.model.Role;
import com.investmentbanking.dealpipeline.model.User;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Unit Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private User adminUser;

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

        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @DisplayName("Should successfully get current user profile")
    void testGetCurrentUser_Success() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act
        UserProfileResponse response = userService.getCurrentUser();

        // Assert
        assertNotNull(response);
        assertEquals("user123", response.getId());
        assertEquals("testuser", response.getUsername());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("Test", response.getFirstName());
        assertEquals("User", response.getLastName());
        assertTrue(response.isEnabled());
        assertTrue(response.getRoles().contains("USER"));
        // Password should not be in response (verified by absence of getPassword() method)

        verify(securityContext).getAuthentication();
        verify(userRepository).findByUsername("testuser");
    }

    @Test
    @DisplayName("Should throw BadRequestException when user not authenticated")
    void testGetCurrentUser_NotAuthenticated() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(null);

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            userService.getCurrentUser();
        });

        assertEquals("User not authenticated", exception.getMessage());
        verify(securityContext).getAuthentication();
        verify(userRepository, never()).findByUsername(anyString());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when user not found")
    void testGetCurrentUser_UserNotFound() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("nonexistent");
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            userService.getCurrentUser();
        });

        assertTrue(exception.getMessage().contains("User"));
        assertTrue(exception.getMessage().contains("nonexistent"));
        verify(userRepository).findByUsername("nonexistent");
    }

    @Test
    @DisplayName("Should successfully create a new user")
    void testCreateUser_Success() {
        // Arrange
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("newuser");
        request.setEmail("newuser@example.com");
        request.setPassword("password123");
        request.setRole(Role.USER);

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId("newuser123");
            return user;
        });

        // Act
        UserProfileResponse response = userService.createUser(request);

        // Assert
        assertNotNull(response);
        assertEquals("newuser123", response.getId());
        assertEquals("newuser", response.getUsername());
        assertEquals("newuser@example.com", response.getEmail());
        assertTrue(response.isEnabled()); // Default should be true
        assertTrue(response.getRoles().contains("USER"));

        verify(userRepository).existsByUsername("newuser");
        verify(userRepository).existsByEmail("newuser@example.com");
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException when username already exists")
    void testCreateUser_UsernameAlreadyExists() {
        // Arrange
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("existinguser");
        request.setEmail("new@example.com");
        request.setPassword("password123");
        request.setRole(Role.USER);

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            userService.createUser(request);
        });

        assertEquals("Username is already taken", exception.getMessage());
        verify(userRepository).existsByUsername("existinguser");
        verify(userRepository, never()).existsByEmail(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException when email already exists")
    void testCreateUser_EmailAlreadyExists() {
        // Arrange
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("newuser");
        request.setEmail("existing@example.com");
        request.setPassword("password123");
        request.setRole(Role.USER);

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            userService.createUser(request);
        });

        assertEquals("Email is already in use", exception.getMessage());
        verify(userRepository).existsByUsername("newuser");
        verify(userRepository).existsByEmail("existing@example.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully create ADMIN user")
    void testCreateUser_AdminRole() {
        // Arrange
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("adminuser");
        request.setEmail("adminuser@example.com");
        request.setPassword("password123");
        request.setRole(Role.ADMIN);

        when(userRepository.existsByUsername("adminuser")).thenReturn(false);
        when(userRepository.existsByEmail("adminuser@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId("adminuser123");
            return user;
        });

        // Act
        UserProfileResponse response = userService.createUser(request);

        // Assert
        assertNotNull(response);
        assertTrue(response.getRoles().contains("ADMIN"));
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully get all users")
    void testGetAllUsers_Success() {
        // Arrange
        List<User> users = new ArrayList<>();
        users.add(testUser);
        users.add(adminUser);

        when(userRepository.findAll()).thenReturn(users);

        // Act
        List<UserProfileResponse> responses = userService.getAllUsers();

        // Assert
        assertNotNull(responses);
        assertEquals(2, responses.size());
        assertEquals("testuser", responses.get(0).getUsername());
        assertEquals("admin", responses.get(1).getUsername());
        verify(userRepository).findAll();
    }

    @Test
    @DisplayName("Should successfully get user by ID")
    void testGetUserById_Success() {
        // Arrange
        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));

        // Act
        UserProfileResponse response = userService.getUserById("user123");

        // Assert
        assertNotNull(response);
        assertEquals("user123", response.getId());
        assertEquals("testuser", response.getUsername());
        verify(userRepository).findById("user123");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when user ID not found")
    void testGetUserById_NotFound() {
        // Arrange
        when(userRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            userService.getUserById("nonexistent");
        });

        assertTrue(exception.getMessage().contains("User"));
        assertTrue(exception.getMessage().contains("nonexistent"));
        verify(userRepository).findById("nonexistent");
    }

    @Test
    @DisplayName("Should successfully update user status to disabled")
    void testUpdateUserStatus_Disable() {
        // Arrange
        UpdateUserStatusRequest request = new UpdateUserStatusRequest();
        request.setActive(false);

        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        UserProfileResponse response = userService.updateUserStatus("user123", request);

        // Assert
        assertNotNull(response);
        assertFalse(response.isEnabled());
        verify(userRepository).findById("user123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully update user status to enabled")
    void testUpdateUserStatus_Enable() {
        // Arrange
        testUser.setEnabled(false);
        UpdateUserStatusRequest request = new UpdateUserStatusRequest();
        request.setActive(true);

        when(userRepository.findById("user123")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        UserProfileResponse response = userService.updateUserStatus("user123", request);

        // Assert
        assertNotNull(response);
        assertTrue(response.isEnabled());
        verify(userRepository).findById("user123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when updating non-existent user")
    void testUpdateUserStatus_UserNotFound() {
        // Arrange
        UpdateUserStatusRequest request = new UpdateUserStatusRequest();
        request.setActive(false);

        when(userRepository.findById("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            userService.updateUserStatus("nonexistent", request);
        });

        assertTrue(exception.getMessage().contains("User"));
        verify(userRepository).findById("nonexistent");
        verify(userRepository, never()).save(any(User.class));
    }
}
