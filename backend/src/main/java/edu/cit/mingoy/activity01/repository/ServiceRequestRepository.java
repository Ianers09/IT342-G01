package edu.cit.mingoy.activity01.repository;

import edu.cit.mingoy.activity01.model.ServiceRequest;
import edu.cit.mingoy.activity01.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRequestRepository
        extends JpaRepository<ServiceRequest, Long> {

    List<ServiceRequest> findByCreatedByOrderByDateCreatedDesc(User createdBy);
}