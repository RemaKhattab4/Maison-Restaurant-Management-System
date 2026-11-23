
package com.maison.maisonrestaurant.repository;

import com.maison.maisonrestaurant.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
