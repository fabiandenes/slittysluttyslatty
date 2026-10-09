package slittyslattyslutty.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import slittyslattyslutty.model.Post;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    // Saját posztok lekérése e-mail alapján
    List<Post> findByAuthorEmailIgnoreCase(String authorEmail);
}