
package com.maison.maisonrestaurant.config;

import com.maison.maisonrestaurant.entity.Admin;
import com.maison.maisonrestaurant.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    @Bean
    CommandLineRunner createFirstAdmin(
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder,
            @Value("${maison.admin.name}") String name,
            @Value("${maison.admin.email}") String email,
            @Value("${maison.admin.password}") String password) {

        return args -> {
            String normalizedEmail = email.trim().toLowerCase();

            Admin admin = adminRepository
                    .findByEmailIgnoreCase(normalizedEmail)
                    .orElse(null);

            if (admin == null) {
                admin = new Admin();
                admin.setName(name);
                admin.setEmail(normalizedEmail);
                admin.setPassword(passwordEncoder.encode(password));

                adminRepository.save(admin);

                System.out.println("First MAISON admin created.");

            } else {
                System.out.println(
                        "Admin password matches properties: " +
                                passwordEncoder.matches(password, admin.getPassword())
                );

                admin.setName(name);
                admin.setEmail(normalizedEmail);

                if (admin.getPassword() == null ||
                        !passwordEncoder.matches(password, admin.getPassword())) {

                    admin.setPassword(passwordEncoder.encode(password));
                    adminRepository.save(admin);

                    System.out.println("MAISON admin password updated.");
                }
            }
        };
    }
}
