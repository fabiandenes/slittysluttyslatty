package slittyslattyslutty.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import slittyslattyslutty.model.Post;
import slittyslattyslutty.repository.PostRepository;

import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    private final PostRepository postRepository;

    @Autowired
    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    // 1. Összes poszt lekérése az adatbázisból
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    // 2. Saját posztok lekérése e-mail cím alapján
    public List<Post> getPostsByAuthorEmail(String email) {
        return postRepository.findByAuthorEmailIgnoreCase(email);
    }

    // 3. Új poszt mentése a PostgreSQL-be
    public Post createPost(Post post) {
        return postRepository.save(post);
    }

    // 4. Poszt keresése ID alapján
    public Optional<Post> getPostById(Long id) {
        return postRepository.findById(id);
    }

    // 5. Poszt törlése ID alapján
    public void deletePost(Long id) {
        postRepository.deleteById(id);
    }
}