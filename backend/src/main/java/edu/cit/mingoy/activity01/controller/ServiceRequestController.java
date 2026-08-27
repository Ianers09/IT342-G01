package edu.cit.mingoy.activity01.controller;

import edu.cit.mingoy.activity01.model.ServiceRequest;
import edu.cit.mingoy.activity01.model.User;
import edu.cit.mingoy.activity01.repository.ServiceRequestRepository;
import edu.cit.mingoy.activity01.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(originPatterns = "http://localhost:*")
public class ServiceRequestController {

    private final ServiceRequestRepository serviceRequestRepository;
    private final UserRepository userRepository;

    public ServiceRequestController(
            ServiceRequestRepository serviceRequestRepository,
            UserRepository userRepository) {

        this.serviceRequestRepository = serviceRequestRepository;
        this.userRepository = userRepository;
    }

    private Optional<User> getCurrentUser(Authentication authentication) {

        if (authentication == null ||
                authentication.getName() == null) {

            return Optional.empty();
        }

        return userRepository.findByEmail(
                authentication.getName()
        );
    }

    private Map<String, Object> toResponse(
            ServiceRequest request) {

        return Map.of(
                "id", request.getId(),
                "title", request.getTitle(),
                "description", request.getDescription(),
                "category", request.getCategory(),
                "dateCreated", request.getDateCreated(),
                "createdBy", request.getCreatedBy().getUsername()
        );
    }

    @PostMapping
    public ResponseEntity<?> createRequest(
            @RequestBody ServiceRequest request,
            Authentication authentication) {

        Optional<User> userOptional =
                getCurrentUser(authentication);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(401).body(
                    Map.of(
                            "message",
                            "Unauthorized"
                    )
            );
        }

        if (request.getTitle() == null ||
                request.getTitle().trim().isEmpty() ||
                request.getDescription() == null ||
                request.getDescription().trim().isEmpty() ||
                request.getCategory() == null ||
                request.getCategory().trim().isEmpty()) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Title, description and category are required"
                    )
            );
        }

        request.setId(null);
        request.setCreatedBy(userOptional.get());

        ServiceRequest savedRequest =
                serviceRequestRepository.save(request);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Service request created successfully",
                        "request",
                        toResponse(savedRequest)
                )
        );
    }

    @GetMapping
    public ResponseEntity<?> getMyRequests(
            Authentication authentication) {

        Optional<User> userOptional =
                getCurrentUser(authentication);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(401).body(
                    Map.of(
                            "message",
                            "Unauthorized"
                    )
            );
        }

        List<Map<String, Object>> requests =
                serviceRequestRepository
                        .findByCreatedByOrderByDateCreatedDesc(
                                userOptional.get()
                        )
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(requests);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRequestById(
            @PathVariable Long id,
            Authentication authentication) {

        Optional<User> userOptional =
                getCurrentUser(authentication);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(401).body(
                    Map.of(
                            "message",
                            "Unauthorized"
                    )
            );
        }

        Optional<ServiceRequest> requestOptional =
                serviceRequestRepository.findById(id);

        if (requestOptional.isEmpty()) {
            return ResponseEntity.status(404).body(
                    Map.of(
                            "message",
                            "Service request not found"
                    )
            );
        }

        ServiceRequest request =
                requestOptional.get();

        if (!request.getCreatedBy()
                .getId()
                .equals(userOptional.get().getId())) {

            return ResponseEntity.status(403).body(
                    Map.of(
                            "message",
                            "You are not allowed to access this service request"
                    )
            );
        }

        return ResponseEntity.ok(
                toResponse(request)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRequest(
            @PathVariable Long id,
            @RequestBody ServiceRequest updatedRequest,
            Authentication authentication) {

        Optional<User> userOptional =
                getCurrentUser(authentication);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(401).body(
                    Map.of(
                            "message",
                            "Unauthorized"
                    )
            );
        }

        Optional<ServiceRequest> requestOptional =
                serviceRequestRepository.findById(id);

        if (requestOptional.isEmpty()) {
            return ResponseEntity.status(404).body(
                    Map.of(
                            "message",
                            "Service request not found"
                    )
            );
        }

        ServiceRequest existingRequest =
                requestOptional.get();

        if (!existingRequest
                .getCreatedBy()
                .getId()
                .equals(userOptional.get().getId())) {

            return ResponseEntity.status(403).body(
                    Map.of(
                            "message",
                            "You are not allowed to update this service request"
                    )
            );
        }

        if (updatedRequest.getTitle() == null ||
                updatedRequest.getTitle().trim().isEmpty() ||
                updatedRequest.getDescription() == null ||
                updatedRequest.getDescription().trim().isEmpty() ||
                updatedRequest.getCategory() == null ||
                updatedRequest.getCategory().trim().isEmpty()) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Title, description and category are required"
                    )
            );
        }

        existingRequest.setTitle(
                updatedRequest.getTitle()
        );

        existingRequest.setDescription(
                updatedRequest.getDescription()
        );

        existingRequest.setCategory(
                updatedRequest.getCategory()
        );

        ServiceRequest savedRequest =
                serviceRequestRepository.save(
                        existingRequest
                );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Service request updated successfully",
                        "request",
                        toResponse(savedRequest)
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequest(
            @PathVariable Long id,
            Authentication authentication) {

        Optional<User> userOptional =
                getCurrentUser(authentication);

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(401).body(
                    Map.of(
                            "message",
                            "Unauthorized"
                    )
            );
        }

        Optional<ServiceRequest> requestOptional =
                serviceRequestRepository.findById(id);

        if (requestOptional.isEmpty()) {
            return ResponseEntity.status(404).body(
                    Map.of(
                            "message",
                            "Service request not found"
                    )
            );
        }

        ServiceRequest request =
                requestOptional.get();

        if (!request.getCreatedBy()
                .getId()
                .equals(userOptional.get().getId())) {

            return ResponseEntity.status(403).body(
                    Map.of(
                            "message",
                            "You are not allowed to delete this service request"
                    )
            );
        }

        serviceRequestRepository.delete(request);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Service request deleted successfully"
                )
        );
    }
}