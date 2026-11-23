package com.maison.maisonrestaurant.repository;

import com.maison.maisonrestaurant.dto.CustomerSummary;
import com.maison.maisonrestaurant.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // Customer summary for admin dashboard
    @Query("""
        SELECT new com.maison.maisonrestaurant.dto.CustomerSummary(
            o.customerName,
            o.customerPhone,
            COUNT(o.id),
            SUM(o.totalPrice)
        )
        FROM Order o
        WHERE o.status <> com.maison.maisonrestaurant.entity.OrderStatus.CANCELLED
        GROUP BY o.customerName, o.customerPhone
        ORDER BY o.customerName
        """)
    List<CustomerSummary> findCustomerSummaries();

    // Get customer orders with their items and products
    @EntityGraph(attributePaths = {"items", "items.product"})
    List<Order> findByCustomer_IdOrderByCreatedAtDesc(Long customerId);
}