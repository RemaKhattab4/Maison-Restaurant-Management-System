
package com.maison.maisonrestaurant;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/api/test")
    public String test() {
        return "Maison Restaurant API is running!";
    }
}
