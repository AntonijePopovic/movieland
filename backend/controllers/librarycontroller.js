import { db } from "../server.js";

export const getLikedByUser = (req, res) => {
  const { username } = req.params;
  const { search, filter, sort } = req.query;

  let baseQuery = `
    SELECT film.ID, film.naziv, film.trailer_url, film.naziv_zanra, film.reziser, film.description, film_korisnik.comment
    FROM film
    INNER JOIN film_korisnik ON film.ID = film_korisnik.id_film
    INNER JOIN zanr ON film.naziv_zanra = zanr.naziv
    WHERE film_korisnik.korisnik_username = ?
  `;
  const queryParams = [username];

  if (search) {
    baseQuery += ` AND (film.naziv LIKE ?  OR film.naziv_zanra LIKE ? OR film.reziser LIKE ? OR film.description LIKE ?)`;
    const searchQuery = `%${search}%`;
    queryParams.push(searchQuery, searchQuery, searchQuery, searchQuery);
  }

  if (filter !== '-') {
    let column;
    switch (filter) {
      case 'Genre':
        column = 'film.naziv_zanra';
        break;
      case 'Artist':
        column = 'film.reziser';
        break;
      case 'Title':
        column = 'film.naziv';
        break;
      case 'Description':
        column = 'film.description';
        break;
      case 'Comment':
        column = 'film_korisnik.comment';
        break;
      default:
        column = null;
        break;
    }
    if (column) {
      baseQuery += ` ORDER BY ${column} ${sort === 'asc' ? 'ASC' : 'DESC'}`;
    }
  }

  db.query(baseQuery, queryParams, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
};

export const getRestOfMovies = (req, res) => {
  
  const { filter, sort, search } = req.query;
  const username = req.params.username;

  let baseQuery = `
    SELECT f.ID, f.naziv AS naziv_film, f.trailer_url, f.reziser, f.description, z.naziv AS zanr_naziv
    FROM film f
    INNER JOIN zanr z ON z.naziv = f.naziv_zanra
    WHERE f.ID NOT IN (
        SELECT id_film
        FROM film_korisnik
        WHERE korisnik_username = ?
    )`;

  let queryParams = [username];

  if (search) {
    baseQuery += ` AND (f.naziv LIKE ? OR z.naziv LIKE ? OR f.description LIKE ? OR f.reziser LIKE ?)`;
    const searchQuery = `%${search}%`;
    queryParams.push(searchQuery, searchQuery, searchQuery);
  }

  if (filter !== '-') {
    let column;
    switch (filter) {
      case 'Genre':
        column = 'z.naziv';
        break;
      case 'Title':
        column = 'f.naziv';
        break;
      case 'Director':
        column = 'film.reziser';
        break;
      case 'Description':
        column = 'film.description';
        break;
      default:
        column = null;
        break;
    }
    if (column) {
      baseQuery += ` ORDER BY ${column} ${sort === 'asc' ? 'ASC' : 'DESC'}`;
    }
  }

  db.query(baseQuery, queryParams, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
};

export const addComment = (req, res) => {
  console.log("Received request:", req.method, req.url);
  console.log("Request params:", req.params);
  console.log("Request body:", req.body);

  const { username, movie_id } = req.params;
  const { comment } = req.body;

  // Check user existence
  const checkUserQuery = "SELECT * FROM korisnik WHERE username = ?";
  db.query(checkUserQuery, [username], (err, userResult) => {
    if (err) {
      console.error("Error checking user:", err);
      return res.status(500).json({ error: "Error checking user" });
    }

    if (userResult.length === 0) {
      console.log("User does not exist:", username);
      return res.status(404).json({ error: "User does not exist" });
    }

    // Check movie existence
    const checkMovieQuery = "SELECT * FROM film WHERE ID = ?";
    db.query(checkMovieQuery, [movie_id], (err, movieResult) => {
      if (err) {
        console.error("Error checking movie:", err);
        return res.status(500).json({ error: "Error checking movie" });
      }

      if (movieResult.length === 0) {
        console.log("Movie does not exist:", movie_id);
        return res.status(404).json({ error: "Movie does not exist" });
      }

      // Check if comment exists
      const checkCommentQuery = "SELECT * FROM film_korisnik WHERE id_film = ? AND korisnik_username = ?";
      db.query(checkCommentQuery, [movie_id, username], (err, commentResult) => {
        if (err) {
          console.error("Error checking comment:", err);
          return res.status(500).json({ error: "Error checking comment" });
        }

        if (commentResult.length > 0) {
          // Update existing comment
          const updateCommentQuery = "UPDATE film_korisnik SET comment = ? WHERE id_film = ? AND korisnik_username = ?";
          db.query(updateCommentQuery, [comment, movie_id, username], (err, data) => {
            if (err) {
              console.error("Error updating comment:", err);
              return res.status(500).json({ error: "Error updating comment" });
            }
            console.log("Comment updated successfully!");
            return res.json({ message: "Comment updated successfully!" });
          });
        } else {
          // Insert new comment
          const addCommentQuery = "INSERT INTO film_korisnik (id_film, korisnik_username, comment) VALUES (?, ?, ?)";
          db.query(addCommentQuery, [movie_id, username, comment], (err, data) => {
            if (err) {
              console.error("Error adding comment:", err);
              return res.status(500).json({ error: "Error adding comment" });
            }
            console.log("Comment added successfully!");
            return res.json({ message: "Comment added successfully!" });
          });
        }
      });
    });
  });
};



export const likeMovie = (req, res) => {
  const { username, movie_id } = req.params;
  const { ocjena } = req.body; //opciono

  console.log("Received request to like movie", { username, movie_id, ocjena });

  const checkUserQuery = "SELECT * FROM korisnik WHERE username = ?";
  db.query(checkUserQuery, [username], (err, userResult) => {
    if (err) {
      console.error("Error checking user:", err);
      return res.json(err);
    }

    if (userResult.length === 0) {
      console.log("User does not exist:", username);
      return res.status(404).json("Korisnik ne postoji!");
    }

    const checkMovieQuery = `SELECT * FROM film WHERE ID = ? AND ID NOT IN (
      SELECT id_film FROM film_korisnik WHERE korisnik_username = ?
    );`;
    db.query(checkMovieQuery, [movie_id, username], (err, movieResult) => {
      if (err) {
        console.error("Error checking movie:", err);
        return res.json(err);
      }

      if (movieResult.length === 0) {
        console.log("Movie does not exist or has already been liked:", movie_id);
        return res.status(404).json("film ne postoji!");
      }

      const checkLikeQuery = "SELECT * FROM film_korisnik WHERE id_film = ? AND korisnik_username = ?";
      db.query(checkLikeQuery, [movie_id, username], (err, likeResult) => {
        if (err) {
          console.error("Error checking like:", err);
          return res.json(err);
        }

        if (likeResult.length > 0) {
          console.log("Movie already liked:", movie_id);
          return res.status(400).json("film vec lajkovana!");
        }

        const q = "INSERT INTO film_korisnik (id_film, korisnik_username, ocjena) VALUES (?, ?, ?)";
        db.query(q, [movie_id, username, ocjena || null], (err, data) => {
          if (err) {
            console.error("Error inserting like:", err);
            return res.json(err);
          }
          console.log("Movie successfully liked:", movie_id);
          return res.json("uspjesno lajkovana film!");
        });
      });
    });
  });
};

export const LikeCount = (req, res) => {
  const { username } = req.params;
  const q = `
            select count(*) as LikedCnt
            from film_korisnik
            where korisnik_username=?
    `;
  db.query(q, [username], (err, data) => {
    if (err) return res.json(err);
    if (data.length === 0) return res.status(404).json("Korisnik ne postoji!");
    return res.json(data[0]);
  });
};

export const updateRateOfMovie = (req, res) => {
  const { username, movie_id } = req.params;
  const { ocjena } = req.body;

  // Check if the user has liked the movie
  const checkLikeQuery =
    "SELECT * FROM film_korisnik WHERE id_film = ? AND korisnik_username = ?";
  db.query(checkLikeQuery, [movie_id, username], (err, likeResults) => {
    if (err) return res.json(err);

    const likedMovie = likeResults.length > 0;

    if (!likedMovie) return res.status(400).json("User has not liked this movie");

    // Update the rating for the movie in the film_korisnik table
    const updateRatingQuery =
      "UPDATE film_korisnik SET ocjena = ? WHERE id_film = ? AND korisnik_username = ?";
    db.query(updateRatingQuery, [ocjena, movie_id, username], (err, result) => {
      if (err) return res.json(err);
      return res.json("Ocjena pjesme za korisnika uspjesno azurirana!");
    });
  });
};

export const showComments = (req, res) => {
  const { movie_id } = req.params;

  const query = `
    SELECT k.username, fk.comment
    FROM film_korisnik fk
    JOIN korisnik k ON fk.korisnik_username = k.username
    WHERE fk.id_film = ?
  `;
  
  db.query(query, [movie_id], (err, results) => {
    if (err) {
      console.error('Error fetching comments:', err);
      return res.status(500).json({ error: 'Error fetching comments' });
    }

    // Format results as an array of objects with username and comment
    const comments = results.map(row => ({
      username: row.username,
      comment: row.comment
    }));

    res.json(comments);
  });
};


export const removeLike = (req, res) => {
  const { username, movie_id } = req.params;

  const deleteLikeQuery =
    "DELETE FROM film_korisnik WHERE id_film = ? AND korisnik_username = ?";
  db.query(deleteLikeQuery, [movie_id, username], (err, result) => {
    if (err) return res.json(err);
    return res.json("Movie disliked successfully");
  });
};

export const getRateOfMovie = (req, res) => {
  const { username, movie_id } = req.params;
  const q =
    "select ocjena from film_korisnik where id_film=? and korisnik_username=?";
  db.query(q, [movie_id, username], (err, data) => {
    if (err) return res.json(err);
    if (data.length === 0)
      return res
        .status(404)
        .json("Ne postoji ocjena za ovu pjesmu od korisnika!");
    return res.json(data[0]);
  });
};
