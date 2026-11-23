
package com.maison.maisonrestaurant.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final Path uploadDirectory =
            Paths.get("uploads").toAbsolutePath().normalize();

    private static final Set<String> ALLOWED_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(
            @RequestParam("image") MultipartFile image) {

        try {
            if (image.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Please select an image."));
            }

            if (!ALLOWED_TYPES.contains(image.getContentType())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Only JPG, PNG and WEBP images are allowed."));
            }

            Files.createDirectories(uploadDirectory);

            String originalName = image.getOriginalFilename();
            String extension = originalName != null &&
                    originalName.lastIndexOf(".") >= 0
                    ? originalName.substring(originalName.lastIndexOf("."))
                    : "";

            String fileName = UUID.randomUUID() + extension;

            Path filePath = uploadDirectory.resolve(fileName).normalize();

            if (!filePath.startsWith(uploadDirectory)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid file name."));
            }

            image.transferTo(filePath);

            return ResponseEntity.ok(
                    Map.of("imageUrl", "/uploads/" + fileName)
            );

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Could not upload image."));
        }
    }
}
