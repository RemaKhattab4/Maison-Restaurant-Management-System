
package com.maison.maisonrestaurant.config;

import com.maison.maisonrestaurant.entity.DeliveryArea;
import com.maison.maisonrestaurant.repository.DeliveryAreaRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
public class DeliveryAreaInitializer {

    @Bean
    CommandLineRunner initializeDeliveryAreas(
            DeliveryAreaRepository repository) {

        return args -> {

            addAreaIfMissing(repository, "Amman", "1.00");
            addAreaIfMissing(repository, "Zarqa", "2.00");

        };
    }

    private void addAreaIfMissing(
            DeliveryAreaRepository repository,
            String governorate,
            String fee) {

        if (repository.findByGovernorateIgnoreCase(governorate).isEmpty()) {

            DeliveryArea area = new DeliveryArea();

            area.setGovernorate(governorate);
            area.setDeliveryFee(new BigDecimal(fee));
            area.setActive(true);

            repository.save(area);
        }
    }
}
