import React, { useContext, useEffect, useState } from 'react';
import styles from "./Library.module.css";
import Navbar from "../komponente/Navbar";
import { AuthContext } from '../context/authContext';
import { MovieContext } from '../context/MovieContext';
import axios from 'axios';
import { useNavigate } from 'react-router';


const Kartica = ({ id, naziv, trajanje, artist, url, naziv_zanra, comment, onMovieDelete, onCommentChange }) => {
  const { currentUser } = useContext(AuthContext);
  const { removeMovie } = useContext(MovieContext);
  const [editing, setEditing] = useState(false);
  const [newComment, setNewComment] = useState(comment || '');

  const unlikeMovie = async () => {
    try {
      const res = await axios.delete(`/library/${currentUser.username}/${id}`);
      alert("Movie removed!");
      if (onMovieDelete) {
        onMovieDelete(id);
      }
      removeMovie(id);
    } catch (err) {
      alert("Error removing movie!");
      console.error("Error removing movie!", err);
    }
  };

  const handleCommentClick = () => {
    setEditing(true);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/library/${currentUser.username}/${id}`, { comment: newComment });
      if (res.status === 200) {
        onCommentChange(id, newComment);
        setEditing(false);
        alert(JSON.stringify(res.data, null, 2)); 
      } else {
        alert("Failed to update comment!");
      }
    } catch (err) {
      alert("Error updating comment!");
      console.error("Error updating comment!", err);
    }
  };  

  return (
    <div className={styles.MovieItem}>
      <h4 className={styles.MovieName}>{naziv}</h4>
      <h5 className={styles.MovieArtist}>{artist}</h5>
      <h5 className={styles.MovieComment} title='Edit comment' onClick={handleCommentClick}>
        {comment ? comment : "Add comment"}
      </h5>
      {editing && (
        <form onSubmit={handleCommentSubmit}>
          <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} />
          <button type="submit">Dodaj komentar</button>
        </form>
      )}
      <h5 className={styles.MovieDuration}>{trajanje}</h5>
      <h5>{naziv_zanra}</h5>
      <button className={styles.delete} onClick={unlikeMovie}>Remove</button>
    </div>
  );
};

const Library = () => {
  const { removeMovie } = useContext(MovieContext);
  const [library, setLibrary] = useState([]);
  const [likedcnt, setLikedCnt] = useState();
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const [filter, setFilter] = useState({ search: '', filter: '', sort: '' });
  const [slika, setSlika] = useState();
  const [edit, setEdit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate('/login');
    }

    const loadMovies = async () => {
      try {
        const res = await axios.get(`/library/${currentUser.username}`, { params: filter });
        setLibrary(res.data);
      } catch (err) {
        console.error("Error fetching movies!", err);
      }
    };

    const loadLikedCount = async () => {
      try {
        const res = await axios.get(`/library/${currentUser.username}/count`);
        setLikedCnt(res.data.LikedCnt);
      } catch (err) {
        console.error("Error fetching liked count!", err);
      }
    }

    loadMovies();
    loadLikedCount();
  }, [filter]);

  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
  };

  const handleMovieDelete = async (id) => {
    try {
      setLibrary(prevLibrary => prevLibrary.filter(movie => movie.ID !== id));
      setLikedCnt(prevLikedCnt => (prevLikedCnt - 1) >= 0 ? prevLikedCnt - 1 : 0);
      removeMovie(id);
    } catch (err) {
      console.error("Error deleting movie!", err);
    }
  };

  const handleFile = (e) => {
    setSlika(e.target.files[0]);
  };

  const handleChangeImage = async () => {
    const formdata = new FormData();
    formdata.append('slika', slika);
    try {
      await axios.post("/image/", formdata);
      await axios.put("/users/pfp/", {
        slika: `http://localhost:8800/public/slike/${slika.name}`,
      });
      setCurrentUser({
        ...currentUser,
        slika: `http://localhost:8800/public/slike/${slika.name}`,
      });
      localStorage.setItem("user", JSON.stringify(currentUser));
      setEdit(false);
    } catch (err) {
      console.error("Error changing profile picture!", err);
    }
  };

  const handleCommentUpdate = (id, newComment) => {
    setLibrary(prevLibrary =>
      prevLibrary.map(movie =>
        movie.ID === id ? { ...movie, comment: newComment } : movie
      )
    );
  };

  return (
    <div className={styles.LibraryContainer}>
      <Navbar />
      <div className={styles.PageContainer}>
        <div className={styles.ProfileContainer}>
          <div className={styles.ProfileInfo}>
            <img src={currentUser.slika} alt='' className={styles.ProfileImage} />
            <div className={styles.username}>
              <h1 className={styles.name}>{currentUser.username}</h1>
              <h5 className={styles.numofmovies}>Liked movies: {likedcnt}</h5>
            </div>
          </div>
          <div className={styles.changePFP}>
            {edit ? (
              <div>
                <input type="file" onChange={handleFile} />
                <button onClick={handleChangeImage}>Change Image</button>
              </div>
            ) : (
              <button onClick={() => setEdit(true)}>Edit Profile Picture</button>
            )}
          </div>
        </div>
        <div className={styles.MovieList}>
          {library.map(movie => (
            <Kartica
              key={movie.ID}
              id={movie.ID}
              naziv={movie.naziv}
              trajanje={movie.trajanje}
              artist={movie.artist}
              url={movie.url}
              naziv_zanra={movie.naziv_zanra}
              comment={movie.comment}
              onMovieDelete={handleMovieDelete}
              onCommentChange={handleCommentUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
export default Library;