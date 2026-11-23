package com.maison.maisonrestaurant.repository;

import com.maison.maisonrestaurant.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}