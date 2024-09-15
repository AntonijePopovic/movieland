import React, { useEffect, useState } from "react";
import Navbar from "../komponente/Navbar";
import styles from "./Admin.module.css";
import axios from "axios";
import { useNavigate } from "react-router";
import { jwtDecode } from "jwt-decode";

const UserCard = ({ user, onDelete, getUsers }) => {
  const handleDelete = async () => {
    try {
      const res = await axios.delete(`/users/${user.username}`);
      onDelete(user.username);
      getUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.userInfo}>
      <h5>{user.username}</h5>
      <h5>{user.email}</h5>
      <button onClick={handleDelete}>DELETE USER</button>
    </div>
  );
};

const MovieCard = ({ movie, onDelete, onEdit }) => {
  const handleMovieDelete = async () => {
    try {
      const res = await axios.delete(`/movies/${movie.ID}`);
      onDelete(movie.ID);
    } catch (err) {
      console.error(err);
    }
  };
  const [editing, setEditing] = useState(false);
  const [editMovie, setEditMovie] = useState(movie);
  const handleMovieEdit = async () => {
    try {
      const res = await axios.put(`/movies/${movie.ID}`, editMovie);
      onEdit(editMovie);
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div key={movie.ID} className={styles.movieInfo}>
      {!editing ? (
        <>
          {movie.ID}
          <h5>{movie.naziv}</h5>
          <button onClick={handleMovieDelete}>DELETE MOVIE</button>
          <button onClick={() => setEditing(true)}>EDIT MOVIE</button>
        </>
      ) : (
        <div className={styles.EditDiv}>
          <input
            type="text"
            name="naziv"
            value={editMovie.naziv}
            className={styles.NewMovieInput}
            onChange={(e) =>
              setEditMovie({ ...editMovie, naziv: e.target.value })
            }
          />
          <input
            type="text"
            name="trailer_url"
            value={editMovie.trailer_url}
            className={styles.NewMovieInput}
            onChange={(e) => setEditMovie({ ...editMovie, trailer_url: e.target.value })}
          />
           <input
            type="text"
            name="reziser"
            value={editMovie.reziser}
            className={styles.NewMovieInput}
            onChange={(e) => setEditMovie({ ...editMovie, reziser: e.target.value })}
          />
           <input
            type="text"
            name="godina"
            value={editMovie.godina}
            className={styles.NewMovieInput}
            onChange={(e) => setEditMovie({ ...editMovie, godina: e.target.value })}
          />
           <input
            type="longtext"
            name="description"
            value={editMovie.description}
            className={styles.NewMovieInput}
            onChange={(e) => setEditMovie({ ...editMovie, description: e.target.value })}
          />
          <input
            type="text"
            name="naziv_zanra"
            value={editMovie.naziv_zanra}
            className={styles.NewMovieInput}
            onChange={(e) =>
              setEditMovie({ ...editMovie, naziv_zanra: e.target.value })
            }
          />
          <button onClick={handleMovieEdit}>SAVE</button>
          <button onClick={() => setEditing(false)}>CANCEL</button>
        </div>
      )}
    </div>
  );
};

const GenreCard = ({ genre, onDelete, onEdit }) => {
  const handleGenreDelete = async () => {
    try {
      const res = await axios.delete(`/genres/${genre.naziv}`);
      onDelete(genre.naziv);
    } catch (err) {
      console.error(err);
    }
  };
  const [editing, setEditing] = useState(false);
  const [editGenre, setEditGenre] = useState(genre);

  const handleGenreEdit = async () => {
    try {
      const res = await axios.put(`/genres/${genre.naziv}`, editGenre);
      onEdit(editGenre);
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div key={genre.ID} className={styles.genreInfo}>
      {!editing ? (
        <>
          <h5>{genre.naziv}</h5>
          <button onClick={handleGenreDelete}>DELETE</button>
          <button onClick={() => setEditing(true)}>EDIT</button>
        </>
      ) : (
        <div className={styles.EditDiv}>
          <input
            type="text"
            name="naziv"
            value={editGenre.naziv_novi}
            onChange={(e) =>
              setEditGenre({ ...editGenre, naziv_novi: e.target.value })
            }
          />
          <button onClick={handleGenreEdit}>SAVE</button>
          <button onClick={() => setEditing(false)}>CANCEL</button>
        </div>
      )}
    </div>
  );
};


const AddForm = ({ getMovies, getGenres}) => {
  const [isEditing, setEditing] = useState(-1);

  const [genre, setGenre] = useState();
  const [movie, setMovie] = useState({
    naziv: "",
    trailer_url: "",
    naziv_zanra: "",
    reziser: "",
    godina: "",
    description: "",
  });

  const GenreChange = (e) => {
    setGenre({ [e.target.name]: e.target.value });
  };

  const MovieChange = (e) => {
    setMovie((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenreChange = async (e) => {
    e.preventDefault();
    try {
      alert((await axios.post("/genres/", genre)).data);
      getGenres();
    } catch (err) {
      alert(err.response.data);
    }
  };
  const handleMovieChange = async (e) => {
    e.preventDefault();
    try {
      const res=await axios.post("/movies/", movie);
      alert(res.data)
      getMovies();

    } catch (err) {
      alert("Greska pri dodavanju filma!");
      console.log(err.response.data);
    }
  };


  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  });

  return (
    <>
      <div className={styles.Buttons}>
        <button onClick={() => setEditing(0)}>Add Genre</button>
        <button onClick={() => setEditing(2)}>Add Movie</button>
      </div>

      {isEditing === 0 && (
        <div className={styles.addGenre}>
          <form>
            <label htmlFor="genre">Dodaj zanr(po imenu)</label>
            <input type="text" name="naziv" id="genre" onChange={GenreChange} />

            <button onClick={handleGenreChange}>Dodaj zanr</button>
            <button onClick={() => setEditing(-1)}>Cancel</button>
          </form>
        </div>
      )}
      {/* {isEditing === 1 && (
        <div className={styles.addArtist}>
          <form>
            <label htmlFor="artist">Dodaj izvodjaca(po imenu)</label>
            <input type="text" name="ime" id="artist" onChange={ArtistChange} />

            <button onClick={handleArtistChange}>Dodaj izvodjaca</button>
            <button onClick={() => setEditing(-1)}>Cancel</button>
          </form>
        </div>
      )} */}
      {isEditing === 2 && (
        <div className={styles.addMovie}>
          <form>
            <label htmlFor="name">Dodaj naziv filma</label>
            <input type="text" name="naziv" id="name" onChange={MovieChange} />

            <label htmlFor="link">Dodaj URL trailer-a filma</label>
            <input type="text" name="trailer_url" id="link" onChange={MovieChange} />

            <label htmlFor="reziser">Dodaj režisera</label>
            <input type="text" name="reziser" id="reziser" onChange={MovieChange} />

            <label htmlFor="godina">Dodaj godinu izlaska filma</label>
            <input type="text" name="godina" id="godina" onChange={MovieChange} />

            <label htmlFor="description">Dodaj opis</label>
            <input type="longtext" name="description" id="description" onChange={MovieChange} />

            {/* <label htmlFor="globalrate">Unesi opstu ocjenu pjesme</label>
            <input
              type="text"
              name="ocjena"
              id="globalrate"
              onChange={MovieChange}
            /> */}

            <label htmlFor="genrename">Unesi naziv zanra</label>
            <input
              type="text"
              name="naziv_zanra"
              id="genrename"
              onChange={MovieChange}
            />

            <button onClick={handleMovieChange}>Dodaj film</button>
            <button onClick={() => setEditing(-1)}>Cancel</button>
          </form>
        </div>
      )}
  
    </>
  );
};

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const navigate = useNavigate();

  const getUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8800/api/users");
      const nonAdminUsers = res.data.filter((user) => user.je_admin === 0);
      setUsers(nonAdminUsers);
    } catch (err) {
      console.error(err);
    }
  };

  const getMovies = async () => {
    try {
      const res = await axios.get("http://localhost:8800/api/movies");
      setMovies(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getGenres = async () => {
    try {
      const res = await axios.get("http://localhost:8800/api/genres");
      setGenres(res.data);
    } catch (err) {
      console.error(err);
    }
  };


  const handleDeleteUser = (username) => {
    setUsers(users.filter((user) => user.username !== username));
  };

  const handleDeleteMovie = (id) => {
    setMovies(movies.filter((movie) => movie.ID !== id));
  };

  const handleDeleteGenre = (naziv) => {
    setGenres(genres.filter((genre) => genre.naziv !== naziv));
  };

  const handleEditMovie = (editedMovie) => {
    setMovies(
      movies.map((movie) => (movie.ID === editedMovie.ID ? editedMovie : movie))
    );
  };

  const handleEditGenre = (editedGenre) => {
    setGenres(
      genres.map((genre) =>
        genre.naziv === editedGenre.naziv ? editedGenre : genre
      )
    );
  };


  const checkAdmin = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.je_admin !== 1) {
        // Assuming 1 means admin
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      navigate("/login");
    }
  };

  useEffect(() => {
    checkAdmin();
    getUsers();
    getMovies();
    getGenres();
  }, []);

  const [display, setDisplay] = useState(-1);

  return (
    <>
      <Navbar />
      <div className={styles.adminContainer}>
        <h2>ADMIN STRANICA</h2>
        <div className={styles.adminWrapper}>
          <AddForm getGenres={getGenres} getMovies={getMovies} />
          <div className={styles.Buttons}>
            <button onClick={() => setDisplay(0)}>Show User Management</button>
            <button onClick={() => setDisplay(1)}>Show Movie Management</button>
            <button onClick={() => setDisplay(2)}>Show Genre Management</button>
            {display!==-1 &&
              <button onClick={() => setDisplay(-1)}>CANCEL</button>
            }
          </div>

          {display === 0 && (
            <div className={styles.UserManagement}>
              
              {users.map((user) => (
                <UserCard getUsers={getUsers}
                  key={user.username}
                  user={user}
                  onDelete={handleDeleteUser}
                />
              ))}
            </div>
          )}
          {display === 1 && (
            <div className={styles.MovieManagement}>

              {movies.map((movie) => (
                <MovieCard
                  key={movie.ID}
                  movie={movie}
                  onEdit={handleEditMovie}
                  onDelete={handleDeleteMovie}
                />
              ))}
            </div>
          )}
          {display === 2 && (
            <div className={styles.GenreManagement}>

              {genres.map((genre) => (
                <GenreCard
                  key={genre.ID}
                  genre={genre}
                  onDelete={handleDeleteGenre}
                  onEdit={handleEditGenre}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Admin;
