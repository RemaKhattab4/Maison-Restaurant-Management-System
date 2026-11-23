
package com.maison.maisonrestaurant.controller;

import com.maison.maisonrestaurant.entity.DeliveryArea;
import com.maison.maisonrestaurant.service.DeliveryAreaService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/delivery-areas")
public class DeliveryAreaController {

    private final DeliveryAreaService service;

    public DeliveryAreaController(DeliveryAreaService service) {
        this.service = service;
    }

    // Get all delivery areas
    @GetMapping
    public List<DeliveryArea> getAllAreas() {
        return service.getAllAreas();
    }

    // Add new governorate
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DeliveryArea addArea(@RequestBody DeliveryArea area) {
        return service.addArea(area);
    }

    // Update delivery fee
    @PutMapping("/{id}/fee")
    public DeliveryArea updateFee(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> request) {

        return service.updateFee(id, request.get("deliveryFee"));
    }

    // Activate or deactivate delivery
    @PutMapping("/{id}/status")
    public DeliveryArea updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {

        return service.updateStatus(id, request.get("active"));
    }

    // Delete governorate
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteArea(@PathVariable Long id) {
        service.deleteArea(id);
    }
}

