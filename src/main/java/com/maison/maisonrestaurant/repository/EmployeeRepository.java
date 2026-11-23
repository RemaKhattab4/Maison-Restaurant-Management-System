
package com.maison.maisonrestaurant.repository;

import com.maison.maisonrestaurant.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
}
