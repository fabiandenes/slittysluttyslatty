package slittyslattyslutty.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import slittyslattyslutty.model.User;
import slittyslattyslutty.repository.UserRepository;
import slittyslattyslutty.service.UserService;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    @Autowired
    public UserController(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @GetMapping("/me")
    public Map<String, Object> getCurrentUser(@AuthenticationPrincipal OAuth2User principal) {
        Map<String, Object> response = new HashMap<>();

        if (principal == null) {
            response.put("authenticated", false);
            return response;
        }

        // 1. Token lejárati dátum ellenőrzése
        Object expAttr = principal.getAttribute("exp");
        if (expAttr != null) {
            long expTimestamp;
            if (expAttr instanceof Number) {
                expTimestamp = ((Number) expAttr).longValue();
            } else if (expAttr instanceof Instant) {
                expTimestamp = ((Instant) expAttr).getEpochSecond();
            } else {
                expTimestamp = Long.parseLong(expAttr.toString());
            }

            if (expTimestamp < Instant.now().getEpochSecond()) {
                response.put("authenticated", false);
                response.put("error", "A token lejárt, kérjük jelentkezz be újra!");
                return response;
            }
        }

        // 2. Vendégek kizárása / e-mail ellenőrzése
        String email = principal.getAttribute("email");

        if (email == null || !userService.isAllowedEmail(email)) {
            response.put("authenticated", false);
            response.put("error", "Nincs jogosultságod az oldal használatához!");
            return response;
        }

        // 3. User adatok lekérése a UserService-ből
        String authorName = userService.mapEmailToAuthorName(email);
        String emoji = userService.mapEmailToEmoji(email);
        String picture = principal.getAttribute("picture");

        Optional<User> existingUser = userRepository.findByEmailIgnoreCase(email);
        if (existingUser.isEmpty()) {
            User newUser = new User(email, authorName, picture);
            userRepository.save(newUser);
        }

        response.put("authenticated", true);
        response.put("email", email);
        response.put("name", authorName);
        response.put("emoji", emoji);
        response.put("picture", picture);

        return response;
    }
}