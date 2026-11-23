
package com.maison.maisonrestaurant.service;

import com.maison.maisonrestaurant.entity.DeliveryArea;
import com.maison.maisonrestaurant.repository.DeliveryAreaRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DeliveryAreaService {

    private final DeliveryAreaRepository repository;

    public DeliveryAreaService(DeliveryAreaRepository repository) {
        this.repository = repository;
    }

    // Get all delivery areas
    public List<DeliveryArea> getAllAreas() {
        return repository.findAll();
    }

    // Add a new delivery area
    @Transactional
    public DeliveryArea addArea(DeliveryArea area) {

        if (area.getGovernorate() == null
                || area.getGovernorate().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Governorate name is required"
            );
        }

        if (area.getDeliveryFee() == null
                || area.getDeliveryFee().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Delivery fee cannot be negative"
            );
        }

        String governorate = area.getGovernorate().trim();

        if (repository.findByGovernorateIgnoreCase(governorate).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This governorate already exists"
            );
        }

        area.setGovernorate(governorate);
        area.setActive(true);

        return repository.save(area);
    }

    // Update delivery fee
    @Transactional
    public DeliveryArea updateFee(Long id, BigDecimal newFee) {

        if (newFee == null || newFee.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Delivery fee cannot be negative"
            );
        }

        DeliveryArea area = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Delivery area not found"
                ));

        area.setDeliveryFee(newFee);

        return repository.save(area);
    }

    // Activate or deactivate delivery
    @Transactional
    public DeliveryArea updateStatus(Long id, boolean active) {

        DeliveryArea area = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Delivery area not found"
                ));

        area.setActive(active);

        return repository.save(area);
    }

    // Delete a delivery area
    @Transactional
    public void deleteArea(Long id) {

        DeliveryArea area = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Delivery area not found"
                ));

        repository.delete(area);
    }
}

