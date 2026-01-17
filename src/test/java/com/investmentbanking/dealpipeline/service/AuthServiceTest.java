package com.investmentbanking.dealpipeline.service;

import com.investmentbanking.dealpipeline.dto.AuthResponse;
import com.investmentbanking.dealpipeline.dto.LoginRequest;
import com.investmentbanking.dealpipeline.dto.RegisterRequest;
import com.investmentbanking.dealpipeline.exception.BadRequestException;
import com.investmentbanking.dealpipeline.model.Role;
import com.investmentbanking.dealpipeline.model.User;
import com.investmentbanking.dealpipeline.repository.UserRepository;
import com.investmentbanking.dealpipeline.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

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

        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setFirstName("Test");
        registerRequest.setLastName("User");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password123");
    }

    @Test
    @DisplayName("Should successfully register a new user")
    void testRegister_Success() {
        // Arrange
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtTokenProvider.generateToken(any(UserDetails.class))).thenReturn("jwt-token");

        // Act
        AuthResponse response = authService.register(registerRequest);

        // Assert
        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals("user123", response.getId());
        assertEquals("testuser", response.getUsername());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("Test", response.getFirstName());
        assertEquals("User", response.getLastName());
        assertTrue(response.getRoles().contains("USER"));

        verify(userRepository).existsByUsername("testuser");
        verify(userRepository).existsByEmail("test@example.com");
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
        verify(jwtTokenProvider).generateToken(any(UserDetails.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException when username already exists")
    void testRegister_UsernameAlreadyExists() {
        // Arrange
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            authService.register(registerRequest);
        });

        assertEquals("Username is already taken", exception.getMessage());
        verify(userRepository).existsByUsername("testuser");
        verify(userRepository, never()).existsByEmail(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException when email already exists")
    void testRegister_EmailAlreadyExists() {
        // Arrange
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            authService.register(registerRequest);
        });

        assertEquals("Email is already in use", exception.getMessage());
        verify(userRepository).existsByUsername("testuser");
        verify(userRepository).existsByEmail("test@example.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully login with valid credentials")
    void testLogin_Success() {
        // Arrange
        Authentication authentication = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(jwtTokenProvider.generateToken(userDetails)).thenReturn("jwt-token");

        // Act
        AuthResponse response = authService.login(loginRequest);

        // Assert
        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals("user123", response.getId());
        assertEquals("testuser", response.getUsername());
        assertEquals("test@example.com", response.getEmail());

        verify(userRepository).findByUsername("testuser");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtTokenProvider).generateToken(userDetails);
    }

    @Test
    @DisplayName("Should throw BadRequestException when user not found")
    void testLogin_UserNotFound() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            authService.login(loginRequest);
        });

        assertEquals("Invalid username or password", exception.getMessage());
        verify(userRepository).findByUsername("testuser");
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    @DisplayName("Should throw BadRequestException when user is disabled")
    void testLogin_UserDisabled() {
        // Arrange
        testUser.setEnabled(false);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            authService.login(loginRequest);
        });

        assertEquals("User account is disabled. Please contact administrator.", exception.getMessage());
        verify(userRepository).findByUsername("testuser");
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    @DisplayName("Should throw BadRequestException when credentials are invalid")
    void testLogin_InvalidCredentials() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            authService.login(loginRequest);
        });

        assertEquals("Invalid username or password", exception.getMessage());
        verify(userRepository).findByUsername("testuser");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtTokenProvider, never()).generateToken(any());
    }
}
