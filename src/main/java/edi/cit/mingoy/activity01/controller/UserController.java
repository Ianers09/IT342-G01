package edi.cit.mingoy.activity01.controller;

import edi.cit.mingoy.activity01.model.User;
import edi.cit.mingoy.activity01.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder =
            PasswordEncoderFactories.createDelegatingPasswordEncoder();

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        if (user.getUsername() == null ||
                user.getEmail() == null ||
                user.getPassword() == null) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", "Username, email and password are required")
            );
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Email already exists")
            );
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User savedUser = userRepository.save(user);

        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {

        if (loginRequest.getEmail() == null ||
                loginRequest.getPassword() == null) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", "Email and password are required")
            );
        }

        Optional<User> userOptional =
                userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(401).body(
                    Map.of("message", "Invalid email or password")
            );
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(
                loginRequest.getPassword(),
                user.getPassword())) {

            return ResponseEntity.status(401).body(
                    Map.of("message", "Invalid email or password")
            );
        }

        return ResponseEntity.ok(
                Map.of(
                        "message", "Login successful",
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail()
                )
        );
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {

        Optional<User> userOptional = userRepository.findById(id);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(404).body(
                    Map.of("message", "User not found")
            );
        }

        return ResponseEntity.ok(userOptional.get());
    }
}