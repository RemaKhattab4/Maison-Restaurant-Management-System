package com.maison.maisonrestaurant.controller;

import com.maison.maisonrestaurant.dto.CustomerSummary;
import com.maison.maisonrestaurant.repository.OrderRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final OrderRepository orderRepository;

    public CustomerController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping
    public List<CustomerSummary> getCustomers() {
        return orderRepository.findCustomerSummaries();
    }
}