package slittyslattyslutty.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class UserService {

    // 1. Engedélyezett emailek
    private static final List<String> ALLOWED_EMAILS = List.of(
            "fabian.denes23@gmail.com",
            "drpbence@gmail.com",
            "nagyannna2002@gmail.com"
    );

    // 2. Email -> Név leképezés
    private static final Map<String, String> AUTHOR_MAP = Map.of(
            "fabian.denes23@gmail.com", "de'",
            "drpbence@gmail.com", "benc",
            "nagyannna2002@gmail.com", "big anna"
    );

    // 3. Email -> Emoji leképezés
    private static final Map<String, String> EMOJI_MAP = Map.of(
            "fabian.denes23@gmail.com", "🐐",
            "drpbence@gmail.com", "👽",
            "nagyannna2002@gmail.com", "💖"
    );

    public boolean isAllowedEmail(String email) {
        if (email == null) return false;
        return ALLOWED_EMAILS.stream().anyMatch(e -> e.equalsIgnoreCase(email));
    }

    public String mapEmailToAuthorName(String email) {
        if (email == null) return "Vendég";
        return AUTHOR_MAP.getOrDefault(email.toLowerCase(), "Vendég");
    }

    public String mapEmailToEmoji(String email) {
        if (email == null) return "✍️";
        return EMOJI_MAP.getOrDefault(email.toLowerCase(), "✍️");
    }
}