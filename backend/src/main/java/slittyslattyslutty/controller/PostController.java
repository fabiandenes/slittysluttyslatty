package slittyslattyslutty.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import slittyslattyslutty.model.Post;
import slittyslattyslutty.service.PostService;
import slittyslattyslutty.service.UserService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final UserService userService;

    @Autowired
    public PostController(PostService postService, UserService userService) {
        this.postService = postService;
        this.userService = userService;
    }

    @GetMapping
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/my-posts")
    public ResponseEntity<?> getMyPosts(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nincs bejelentkezve");
        }
        String email = principal.getAttribute("email");
        return ResponseEntity.ok(postService.getPostsByAuthorEmail(email));
    }

    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody Post postRequest, @AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nincs bejelentkezve!");
        }

        String email = principal.getAttribute("email");
        if (email == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Nem található e-mail cím.");
        }

        Post post = new Post();
        post.setTitle(postRequest.getTitle());
        post.setContent(postRequest.getContent());
        post.setImageBase64(postRequest.getImageBase64());
        
        // A UserService határozza meg a nevet és az emojit
        post.setAuthor(userService.mapEmailToAuthorName(email));
        post.setAuthorEmail(email);
        post.setAuthorEmoji(userService.mapEmailToEmoji(email));

        Post savedPost = postService.createPost(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPost);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id, @AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nincs bejelentkezve!");
        }

        String userEmail = principal.getAttribute("email");
        Optional<Post> postOptional = postService.getPostById(id);

        if (postOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("A poszt nem található.");
        }

        Post post = postOptional.get();

        if (!post.getAuthorEmail().equalsIgnoreCase(userEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Nincs jogosultságod törölni ezt a posztot!");
        }

        postService.deletePost(id);
        return ResponseEntity.ok("Poszt sikeresen törölve.");
    }
}