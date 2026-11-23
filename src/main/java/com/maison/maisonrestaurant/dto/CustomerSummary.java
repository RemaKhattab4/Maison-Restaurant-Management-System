package com.maison.maisonrestaurant.dto;

import java.math.BigDecimal;

public class CustomerSummary {

    private String customerName;
    private String customerPhone;
    private long totalOrders;
    private BigDecimal totalSpent;

    public CustomerSummary(String customerName, String customerPhone,
                           long totalOrders, BigDecimal totalSpent) {
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.totalOrders = totalOrders;
        this.totalSpent = totalSpent;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public BigDecimal getTotalSpent() {
        return totalSpent;
    }
}