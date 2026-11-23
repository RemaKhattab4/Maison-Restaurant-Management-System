
package com.maison.maisonrestaurant.controller;

import com.maison.maisonrestaurant.entity.DeliveryArea;
import com.maison.maisonrestaurant.service.DeliveryAreaService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery-areas")
public class PublicDeliveryAreaController {

    private final DeliveryAreaService service;

    public PublicDeliveryAreaController(DeliveryAreaService service) {
        this.service = service;
    }

    // Get active delivery areas for customers
    @GetMapping
    public List<DeliveryArea> getActiveAreas() {
        return service.getAllAreas()
                .stream()
                .filter(DeliveryArea::isActive)
                .toList();
    }
}
