package edu.cit.mingoy.activity01.controller;

import edu.cit.mingoy.activity01.model.User;
import edu.cit.mingoy.activity01.repository.UserRepository;
import edu.cit.mingoy.activity01.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(originPatterns = "http://localhost:*")
public class UserController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    private final PasswordEncoder passwordEncoder =
            PasswordEncoderFactories
                    .createDelegatingPasswordEncoder();

    public UserController(
            UserRepository userRepository,
            JwtService jwtService) {

        this.userRepository =
                userRepository;

        this.jwtService =
                jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody User user) {

        if (user.getUsername() == null ||
                user.getUsername().trim().isEmpty() ||
                user.getEmail() == null ||
                user.getEmail().trim().isEmpty() ||
                user.getPassword() == null ||
                user.getPassword().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Username, email and password are required"
                            )
                    );
        }

        if (userRepository
                .existsByEmail(user.getEmail())) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Email already exists"
                            )
                    );
        }

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        User savedUser =
                userRepository.save(user);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Registration successful",
                        "id",
                        savedUser.getId(),
                        "username",
                        savedUser.getUsername(),
                        "email",
                        savedUser.getEmail()
                )
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody User loginRequest) {

        if (loginRequest.getEmail() == null ||
                loginRequest.getEmail().trim().isEmpty() ||
                loginRequest.getPassword() == null ||
                loginRequest.getPassword().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Email and password are required"
                            )
                    );
        }

        Optional<User> userOptional =
                userRepository.findByEmail(
                        loginRequest.getEmail()
                );

        if (userOptional.isEmpty()) {

            return ResponseEntity
                    .status(401)
                    .body(
                            Map.of(
                                    "message",
                                    "Invalid email or password"
                            )
                    );
        }

        User user =
                userOptional.get();

        if (!passwordEncoder.matches(
                loginRequest.getPassword(),
                user.getPassword())) {

            return ResponseEntity
                    .status(401)
                    .body(
                            Map.of(
                                    "message",
                                    "Invalid email or password"
                            )
                    );
        }

        String token =
                jwtService.generateToken(
                        user.getEmail()
                );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Login successful",
                        "token",
                        token,
                        "id",
                        user.getId(),
                        "username",
                        user.getUsername(),
                        "email",
                        user.getEmail()
                )
        );
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUser(
            @PathVariable Long id) {

        Optional<User> userOptional =
                userRepository.findById(id);

        if (userOptional.isEmpty()) {

            return ResponseEntity
                    .status(404)
                    .body(
                            Map.of(
                                    "message",
                                    "User not found"
                            )
                    );
        }

        User user =
                userOptional.get();

        return ResponseEntity.ok(
                Map.of(
                        "id",
                        user.getId(),
                        "username",
                        user.getUsername(),
                        "email",
                        user.getEmail()
                )
        );
    }
}