
package com.maison.maisonrestaurant.service;

import com.maison.maisonrestaurant.dto.CreateOrderRequest;
import com.maison.maisonrestaurant.entity.*;
import com.maison.maisonrestaurant.repository.OrderRepository;
import com.maison.maisonrestaurant.repository.ProductRepository;
import com.maison.maisonrestaurant.repository.DeliveryAreaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final DeliveryAreaRepository deliveryAreaRepository;

    public OrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            DeliveryAreaRepository deliveryAreaRepository) {

        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.deliveryAreaRepository = deliveryAreaRepository;
    }

    // Create a new order
    @Transactional
    public Order createOrder(CreateOrderRequest request, Customer customer) {

        Order order = new Order();

        order.setCustomerName(customer.getName());
        order.setCustomerPhone(customer.getPhone());
        order.setCustomer(customer);
        order.setOrderType(request.getOrderType());

        BigDecimal deliveryFee = BigDecimal.ZERO;

// Delivery information
        if (request.getOrderType() == OrderType.DELIVERY) {

            if (request.getDeliveryAddress() == null
                    || request.getDeliveryAddress().isBlank()) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Delivery address is required"
                );
            }

            String governorate = request.getDeliveryGovernorate();

            if (governorate == null || governorate.isBlank()) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Delivery governorate is required"
                );
            }

            DeliveryArea deliveryArea = deliveryAreaRepository
                    .findByGovernorateIgnoreCase(governorate.trim())
                    .orElseThrow(() ->
                            new ResponseStatusException(
                                    HttpStatus.BAD_REQUEST,
                                    "Delivery is not available in this governorate"
                            )
                    );

            if (!deliveryArea.isActive()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Delivery is not available in this governorate"
                );
            }

            deliveryFee = deliveryArea.getDeliveryFee();

            order.setDeliveryGovernorate(deliveryArea.getGovernorate());
            order.setDeliveryAddress(request.getDeliveryAddress());

        } else {

            order.setDeliveryGovernorate(null);
            order.setDeliveryAddress(null);
        }
        // Calculate subtotal and add order items
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CreateOrderRequest.ItemRequest itemRequest : request.getItems()) {

            Product product = productRepository.findById(
                    itemRequest.getProductId()
            ).orElseThrow(() ->
                    new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Product not found: " + itemRequest.getProductId()
                    )
            );

            int quantity = itemRequest.getQuantity();

            if (quantity <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Quantity must be greater than zero"
                );
            }

            if (product.getStockQuantity() < quantity) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Not enough stock for: " + product.getName()
                );
            }

            BigDecimal itemTotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(quantity));

            subtotal = subtotal.add(itemTotal);

            OrderItem orderItem = new OrderItem();

            orderItem.setProduct(product);
            orderItem.setQuantity(quantity);
            orderItem.setUnitPrice(product.getPrice());

            order.addItem(orderItem);

            // Reduce product stock
            product.setStockQuantity(
                    product.getStockQuantity() - quantity
            );

            productRepository.save(product);
        }

        // Calculate final total
        BigDecimal totalPrice = subtotal.add(deliveryFee);

        order.setSubtotal(subtotal);
        order.setDeliveryFee(deliveryFee);
        order.setTotalPrice(totalPrice);

        return orderRepository.save(order);
    }

    // Update order status by admin
    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Order not found"
                        )
                );

        OrderStatus currentStatus = order.getStatus();

        if (currentStatus == OrderStatus.CANCELLED) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cancelled order cannot be updated"
            );
        }

        // Restore stock if order is cancelled
        if (newStatus == OrderStatus.CANCELLED) {

            for (OrderItem item : order.getItems()) {

                Product product = item.getProduct();

                product.setStockQuantity(
                        product.getStockQuantity() + item.getQuantity()
                );

                productRepository.save(product);
            }
        }

        order.setStatus(newStatus);

        return orderRepository.save(order);
    }

    // Customer confirms receiving the order
    @Transactional
    public Order confirmReceived(Long orderId, Customer customer) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Order not found"
                        )
                );

        // Make sure this order belongs to the logged-in customer
        if (order.getCustomer() == null
                || !order.getCustomer().getId().equals(customer.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot access this order"
            );
        }

        // Only ready or out-for-delivery orders can be confirmed
        if (order.getStatus() != OrderStatus.READY
                && order.getStatus() != OrderStatus.OUT_FOR_DELIVERY) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Order is not ready for receipt confirmation"
            );
        }

        order.setStatus(OrderStatus.COMPLETED);

        return orderRepository.save(order);
    }
}

