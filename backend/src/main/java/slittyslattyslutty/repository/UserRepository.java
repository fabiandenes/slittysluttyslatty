package slittyslattyslutty.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import slittyslattyslutty.model.User;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Felhasználó keresése e-mail cím alapján (kis/nagybetű függetlenül)
    Optional<User> findByEmailIgnoreCase(String email);
}