package com.example.backend.controller;

import com.example.backend.model.ContentPage;
import com.example.backend.service.ContentPageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content-pages")
public class ContentPageController {

    private final ContentPageService contentPageService;

    public ContentPageController(ContentPageService contentPageService) {
        this.contentPageService = contentPageService;
    }

    //pobranie wszystkich stron
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ContentPage>> getAllPages() {
        List<ContentPage> pages = contentPageService.getAllPages();
        return ResponseEntity.ok(pages);
    }

    //pobranie strony po slug
    @GetMapping("/slug/{slug}")
    public ResponseEntity<ContentPage> getPageBySlug(@PathVariable String slug) {
        return contentPageService.getPageBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //pobranie strony po ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContentPage> getPageById(@PathVariable Long id) {
        return contentPageService.getPageById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //tworzenie nowej strony
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContentPage> createPage(
            @RequestBody ContentPage page,
            Authentication authentication) {
        page.setUpdatedBy(authentication.getName());
        ContentPage createdPage = contentPageService.createPage(page);
        return ResponseEntity.ok(createdPage);
    }

   //update strony
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContentPage> updatePage(
            @PathVariable Long id,
            @RequestBody ContentPage page,
            Authentication authentication) {
        try {
            ContentPage updatedPage = contentPageService.updatePage(id, page, authentication.getName());
            return ResponseEntity.ok(updatedPage);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    //usuniecie strony
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePage(@PathVariable Long id) {
        contentPageService.deletePage(id);
        return ResponseEntity.noContent().build();
    }

    //inicjalizacja stron
    @PostMapping("/initialize")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> initializePages() {
        contentPageService.initializeDefaultPages();
        return ResponseEntity.ok("Default pages initialized");
    }
}