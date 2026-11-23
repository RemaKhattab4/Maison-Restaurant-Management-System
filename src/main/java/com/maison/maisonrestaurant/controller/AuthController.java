
package com.maison.maisonrestaurant.controller;

import com.maison.maisonrestaurant.dto.AuthRequest;
import com.maison.maisonrestaurant.dto.AuthResponse;
import com.maison.maisonrestaurant.dto.RegisterRequest;
import com.maison.maisonrestaurant.entity.Admin;
import com.maison.maisonrestaurant.entity.Customer;
import com.maison.maisonrestaurant.repository.AdminRepository;
import com.maison.maisonrestaurant.repository.CustomerRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.csrf.CsrfToken;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final CustomerRepository customerRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;

    public AuthController(
            CustomerRepository customerRepository,
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            SecurityContextRepository securityContextRepository) {

        this.customerRepository = customerRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(HttpServletRequest request) {

        jakarta.servlet.http.Cookie[] cookies = request.getCookies();

        if (cookies != null) {
            for (jakarta.servlet.http.Cookie cookie : cookies) {

                if ("XSRF-TOKEN".equals(cookie.getName())) {
                    return Map.of("token", cookie.getValue());
                }
            }
        }

        throw new IllegalStateException("CSRF cookie not found");
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (customerRepository.existsByEmailIgnoreCase(email)
                || adminRepository.existsByEmailIgnoreCase(email)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered"
            );
        }

        Customer customer = new Customer();
        customer.setName(request.getName().trim());
        customer.setEmail(email);
        customer.setPhone(request.getPhone().trim());
        customer.setPassword(passwordEncoder.encode(request.getPassword()));

        customerRepository.save(customer);

        return new AuthResponse(
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                "CUSTOMER"
        );
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody AuthRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        System.out.println("LOGIN CONTROLLER REACHED");
        String email = request.getEmail().trim().toLowerCase();
        Admin storedAdmin = adminRepository
                .findByEmailIgnoreCase(email)
                .orElse(null);

        System.out.println("Admin found: " + (storedAdmin != null));

        System.out.println(
                "Submitted password matches: " +
                        (storedAdmin != null &&
                                passwordEncoder.matches(
                                        request.getPassword(),
                                        storedAdmin.getPassword()
                                ))
        );
        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                email,
                                request.getPassword()
                        )
                );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        securityContextRepository.saveContext(
                context,
                httpRequest,
                httpResponse
        );

        if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {

            Admin admin = adminRepository.findByEmailIgnoreCase(email)
                    .orElseThrow();

            return new AuthResponse(
                    admin.getName(),
                    admin.getEmail(),
                    "",
                    "ADMIN"
            );
        }

        Customer customer = customerRepository.findByEmailIgnoreCase(email)
                .orElseThrow();

        return new AuthResponse(
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                "CUSTOMER"
        );
    }

    @GetMapping("/me")
    public AuthResponse me(Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in"
            );
        }

        String email = authentication.getName();

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            Admin admin = adminRepository.findByEmailIgnoreCase(email)
                    .orElseThrow();

            return new AuthResponse(
                    admin.getName(),
                    admin.getEmail(),
                    "",
                    "ADMIN"
            );
        }

        Customer customer = customerRepository.findByEmailIgnoreCase(email)
                .orElseThrow();

        return new AuthResponse(
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                "CUSTOMER"
        );
    }

    @PostMapping("/logout")
    public Map<String, String> logout(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) {

        new SecurityContextLogoutHandler()
                .logout(request, response, authentication);

        return Map.of("message", "Logged out successfully");
    }
}
