package com.vinman.greetify.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Controller
public class UIController {

    private static final Logger logger = LoggerFactory.getLogger(UIController.class);

    @Value("${api.base.url:http://localhost:4000/api}")
    private String apiBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/")
    public String index(Model model) {
        return "index";
    }

    @GetMapping("/proxy/contacts")
    @ResponseBody
    public ResponseEntity<String> getContacts() {
        String url = apiBaseUrl + "/contacts";
        logger.info("[Proxy] Fetching all contacts from node API: {}", url);
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            logger.info("[Proxy] Received {} bytes from API", response.getBody() != null ? response.getBody().length() : 0);
            return response;
        } catch (Exception e) {
            logger.error("[Proxy] API error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("[]");
        }
    }
}
