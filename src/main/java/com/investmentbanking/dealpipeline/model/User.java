package com.investmentbanking.dealpipeline.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    @Field("username")
    private String username;
    
    @Field("email")
    @Indexed(unique = true)
    private String email;
    
    @Field("password")
    private String password;
    
    @Field("firstName")
    private String firstName;
    
    @Field("lastName")
    private String lastName;
    
    @Field("roles")
    private Set<Role> roles = new HashSet<>();
    
    @Field("enabled")
    private boolean enabled = true;
    
    @Field("createdAt")
    private LocalDateTime createdAt;
    
    @Field("updatedAt")
    private LocalDateTime updatedAt;
}
