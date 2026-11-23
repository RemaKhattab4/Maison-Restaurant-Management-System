
package com.maison.maisonrestaurant.repository;

import com.maison.maisonrestaurant.entity.DeliveryArea;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeliveryAreaRepository
        extends JpaRepository<DeliveryArea, Long> {

    Optional<DeliveryArea> findByGovernorateIgnoreCase(String governorate);
}
