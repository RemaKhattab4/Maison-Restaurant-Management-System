
package com.maison.maisonrestaurant.controller;

import com.maison.maisonrestaurant.dto.CreateOrderRequest;
import com.maison.maisonrestaurant.dto.UpdateOrderStatusRequest;
import com.maison.maisonrestaurant.entity.Customer;
import com.maison.maisonrestaurant.entity.Order;
import com.maison.maisonrestaurant.repository.CustomerRepository;
import com.maison.maisonrestaurant.repository.OrderRepository;
import com.maison.maisonrestaurant.service.OrderService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;

    public OrderController(
            OrderService orderService,
            OrderRepository orderRepository,
            CustomerRepository customerRepository) {

        this.orderService = orderService;
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
    }

    // Get the currently logged-in customer
    private Customer getCustomer(Authentication authentication) {

        return customerRepository.findByEmailIgnoreCase(
                authentication.getName()
        ).orElseThrow(() ->
                new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Customer account not found"
                )
        );
    }

    // Customer creates an order
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Order createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Authentication authentication) {

        return orderService.createOrder(
                request,
                getCustomer(authentication)
        );
    }

    // Admin gets all orders
    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // Customer gets only their own orders
    @GetMapping("/my")
    public List<Order> getMyOrders(Authentication authentication) {

        Customer customer = getCustomer(authentication);

        return orderRepository
                .findByCustomer_IdOrderByCreatedAtDesc(customer.getId());
    }

    // Customer confirms receiving their order
    @PutMapping("/{id}/received")
    public Order confirmReceived(
            @PathVariable Long id,
            Authentication authentication) {

        return orderService.confirmReceived(
                id,
                getCustomer(authentication)
        );
    }

    // Admin gets a specific order
    @GetMapping("/{id}")
    public Order getOrderById(@PathVariable Long id) {

        return orderRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Order not found"
                        )
                );
    }

    // Admin updates order status
    @PutMapping("/{id}/status")
    public Order updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {

        return orderService.updateOrderStatus(
                id,
                request.getStatus()
        );
    }
}
