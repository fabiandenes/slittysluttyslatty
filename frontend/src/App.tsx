import { useState, useEffect } from 'react';
import { type Post, type UserProfile } from './types/blog';

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaData, setMediaData] = useState('');

  // Állapot a fejléc váltakozó szövegéhez és színéhez
  const [headerText, setHeaderText] = useState('SLITTY');
  const [headerColor, setHeaderColor] = useState('#fc00ef');

  // 1. A bejelentkezett user és a posztok betöltése
  useEffect(() => {
    fetch('http://localhost:8080/api/user/me', { credentials: 'include' })
      .then((res) => res.json())
      .then((data: UserProfile) => {
        if (data.authenticated) {
          setUser(data);
          loadPosts(true, data.email);
        } else {
          setUser(null);
          loadPosts(false);
        }
      })
      .catch(() => {
        setUser(null);
        loadPosts(false);
      });
  }, []);

  // Fejléc animáció
  useEffect(() => {
    const words = ['SLITTY', 'SLATTY', 'SLUTTY'];
    const colors = ['#fc00ef', '#2bff00', '#002233'];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % words.length;
      setHeaderText(words[index]);
      setHeaderColor(colors[index]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadPosts = (isAuthenticated: boolean, _userEmail?: string) => {
    const postsUrl = isAuthenticated ? 'http://localhost:8080/api/posts/my-posts' : 'http://localhost:8080/api/posts';

    fetch(postsUrl, { credentials: 'include' })
      .then((res) => res.json())
      .then((data: Post[]) => {
        setPosts(data.reverse());
      })
      .catch((err) => console.error('Hiba a posztok betöltésekor:', err));
  };

  // 2. Új poszt elküldése
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    fetch('http://localhost:8080/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        title, 
        content, 
        imageBase64: mediaData 
      }),
    })
      .then((res) => {
        if (res.ok) {
          setTitle('');
          setContent('');
          setMediaData('');
          loadPosts(user?.authenticated || false, user?.email);
        } else {
          alert('Csak bejelentkezett admin hozhat létre posztot!');
        }
      })
      .catch((err) => console.error('Hiba a mentéskor:', err));
  };

  // 3. Poszt törlése
  const handleDelete = (id: number) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a posztot?')) return;

    fetch(`http://localhost:8080/api/posts/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((res) => {
        if (res.ok) {
          loadPosts(user?.authenticated || false, user?.email);
        } else {
          alert('Hiba történt a poszt törlése során.');
        }
      })
      .catch((err) => console.error('Hiba a törléskor:', err));
  };

  return (
    <div className="blog-container">
      {/* Fejléc */}
      <header className="blog-header">
        <h1 className="animated-header" style={{ color: headerColor }}>
          {headerText}
        </h1>
      </header>

      {/* Fő tartalom */}
      <main className="main-content">
        
        {/* Bejelentkezés / User Konténer */}
        <div className="post-card user-login-card">
          {user?.authenticated ? (
            <div>
                  {user.emoji}
              {/* TISZTA ÉS EGYSZERŰ: Közvetlenül a backendről érkező emoji és név */}
              <p className="user-welcome-text">
                <b>Szia, {user.name}</b>!
              </p>

              <a href="http://localhost:8080/logout">
                <button className="retro-btn logout-btn">
                  Logout
                </button>
              </a>
            </div>
          ) : (
            <div>
              <a href="http://localhost:8080/oauth2/authorization/google">
                <button className="retro-btn">
                  Login with Google
                </button>
              </a>
            </div>
          )}
        </div>

        {/* Új poszt írása */}
        {user?.authenticated && (
          <div className="post-card form-card">
            <h3 className="form-heading">Mi jár a fejedben? 🤔</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="CÍM"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="full-width-input"
                />
              </div>
              <div className="form-group">
                <textarea
                  placeholder="TARTALOM"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="full-width-input"
                />
              </div>

              {/* Fájlfeltöltő */}
              <div className="form-group">
                <label className="file-label">
                  Médiumok csatolása:
                </label>
                <input 
                  type="file" 
                  accept="image/*,video/mp4,audio/mp3,audio/mpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setMediaData(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="file-input"
                />
              </div>

              <button type="submit" className="retro-btn">
                Publish Post!
              </button>
            </form>
          </div>
        )}

        {/* Posztok listája cím */}
        <h2 id="posts-title" className="posts-section-title">
          {user?.authenticated ? 'Saját posztjaim' : ''}
        </h2>

        {posts.length === 0 ? (
          <p>Még nincsenek bejegyzések.</p>
        ) : (
          posts.map((post) => {
            let authorClass = '';
            const email = post.authorEmail?.toLowerCase() || '';

            if (email.includes('deni')) {
              authorClass = 'author-anna';
            } else if (email.includes('bence')) {
              authorClass = 'author-bence';
            } else if (email.includes('denes') || email.includes('dénes')) {
              authorClass = 'author-denes';
            }

            const attachment = post.imageBase64 || '';
            const isVideo = attachment.startsWith('data:video');
            const isAudio = attachment.startsWith('data:audio');
            const isImage = attachment.startsWith('data:image');

            const canDelete = user?.authenticated && user?.email && post.authorEmail &&
              user.email.toLowerCase() === post.authorEmail.toLowerCase();

            return (
              <article key={post.id} className={`post-card article-card ${authorClass}`}>
                
                {/* Törlés gomb */}
                {canDelete && (
                  <button 
                    onClick={() => post.id !== undefined && handleDelete(post.id)}
                    className="delete-btn"
                  >
                    Törlés
                  </button>
                )}

                {/* Fejléc: Emoji, Író és dátum */}
                <div className={`post-meta-header ${canDelete ? 'with-delete-padding' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.4rem' }}>
                      {post.authorEmoji}
                    </span>
                    <span>{post.author}</span>
                  </div>
                  <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString('hu-HU') : 'Recently'}</span>
                </div>

                {/* Cím */}
                <h3 className="post-title">
                  {post.title}
                </h3>

                {/* Tartalom */}
                <div className="post-content-wrapper">
                  <p className="post-text">
                    {post.content
                      ?.replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[&\?][\w\-\.\~]+=[\w\-\.\~%]+)*/g, '')
                      .trim()}
                  </p>
                  
                  {/* Kép megjelenítő */}
                  {isImage && (
                    <div className="media-container">
                      <img 
                        src={attachment} 
                        alt="Post attachment" 
                        className="post-media-img" 
                      />
                    </div>
                  )}

                  {/* MP4 Videó megjelenítő */}
                  {isVideo && (
                    <div className="media-container">
                      <video controls className="post-media-video">
                        <source src={attachment} type="video/mp4" />
                        A böngésződ nem támogatja a videó lejátszását.
                      </video>
                    </div>
                  )}

                  {/* MP3 Audió megjelenítő */}
                  {isAudio && (
                    <div>
                      <audio controls className="post-media-audio">
                        <source src={attachment} type="audio/mpeg" />
                        A böngésződ nem támogatja az audió lejátszását.
                      </audio>
                    </div>
                  )}

                  {/* YouTube Videó beágyazó */}
                  {(() => {
                    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
                    const match = post.content?.match(ytRegex) || attachment.match(ytRegex);
                    
                    if (match && match[1]) {
                      const videoId = match[1];
                      return (
                        <div className="youtube-embed-container">
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                            title="YouTube video player"
                            className="youtube-iframe"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </article>
            );
          })
        )}
      </main>
    </div>
  );
}