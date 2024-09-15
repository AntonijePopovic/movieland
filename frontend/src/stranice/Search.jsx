import React, { useEffect, useState, useContext } from 'react';
import styles from "./Search.module.css";
import Navbar from "../komponente/Navbar";
import { AuthContext } from '../context/authContext';
import { MovieContext } from '../context/MovieContext';
import axios from 'axios';
import { useNavigate } from 'react-router';

// CommentsModal Component
const CommentsModal = ({ comments, onClose }) => (
  <div className={styles.ModalOverlay} onClick={onClose}>
    <div className={styles.ModalContent} onClick={(e) => e.stopPropagation()}>
      <h3>Comments</h3>
      {comments.length > 0 ? (
        <ul>
          {comments.map((comment, index) => (
            <li key={index}>
              <strong>{comment.username}:</strong> {comment.comment}
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments available.</p>
      )}
      <button onClick={onClose}>Close</button>
    </div>
  </div>
);
const Search = () => {
  const { currentUser } = useContext(AuthContext);
  const { addedMovies, addMovie } = useContext(MovieContext);
  const [listOfMovies, setListOfMovies] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filterOption, setFilterOption] = useState("-");
  const [sortOption, setSortOption] = useState("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMovieId, setCurrentMovieId] = useState(null);
  const [comments, setComments] = useState([]);

  const navigate = useNavigate();

  const getMovies = async () => {
    try {
      const res = await axios.get(`/library/${currentUser.username}/exc`, {
        params: {
          filter: filterOption,
          sort: sortOption,
          search: searchText,
        },
      });
      setListOfMovies(res.data);
      console.log("Loaded movies!");
    } catch (err) {
      console.error("Error fetching movies!", err);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate('/login');
    }
    getMovies();
  }, [filterOption, sortOption, searchText]);

  const addMovieEvent = async (id) => {
    console.log(id);
    try {
      const res = await axios.post(`/library/${currentUser.username}/${id}`);
      alert(JSON.stringify(res.data, null, 2)); 
      addMovie(id);
    } catch (err) {
      console.error("Error adding movie!", err);
    }
  };

  const fetchComments = async (movieId) => {
    try {
      const res = await axios.get(`/library/comments/${movieId}`);
      setComments(res.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };
  const openModal = (movieId) => {
    setCurrentMovieId(movieId);
    fetchComments(movieId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentMovieId(null);
    setComments([]);
  };

  const filterList = listOfMovies.filter((movie) => !addedMovies.has(movie.ID));

  const ListItemResult = ({ movie }) => (
    <div className={styles.ListItemResult} key={movie.ID}>
      <h4>{movie.naziv_film}</h4>
      <h5>{movie.trajanje}</h5>
      <h5>{movie.zanr_naziv}</h5>
      <h5>{movie.ocjena}</h5>
      {currentUser.je_admin === 0 ? (
        <button className={styles.Dodaj} onClick={() => addMovieEvent(movie.ID)}>Dodaj film</button>
      ) : null}
      <button className={styles.ViewComments} onClick={() => openModal(movie.ID)}>View Comments</button>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className={styles.SearchContainer}>
        <div className={styles.searchBar}>
          <label htmlFor="searchText" className={styles.SearchLabel}>Search:</label>
          <input type="text" name="searchText" id={styles.searchText} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        </div>
        <div className={styles.FilterTab}>
          <label htmlFor="selectFilter">Filter:</label>
          <select name="selectFilter" id="selectFilter" onChange={(e) => setFilterOption(e.target.value)}>
            <option value="-">-</option>
            <option value="Genre">Genre</option>
            <option value="Artist">Artist</option>
            <option value="Title">Title</option>
          </select>
          <form>
            <label htmlFor="asc" style={{ fontFamily: "sans-serif" }}>Λ</label>
            <input type="radio" name="sort" id="asc" value="asc" checked={sortOption === "asc"} onChange={(e) => setSortOption(e.target.value)} />
            <label htmlFor="desc">V</label>
            <input type="radio" name="sort" id="desc" value="desc" checked={sortOption === "desc"} onChange={(e) => setSortOption(e.target.value)} />
          </form>
        </div>
        <div className={styles.searchResults}>
          <div className={styles.ResultContainer}>
            <div className={styles.ListOfResults}>
              {filterList?.map((movie) => (
                <ListItemResult
                  key={movie.ID}
                  movie={movie}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <CommentsModal comments={comments} onClose={closeModal} />
      )}
    </>
  );
};

export default Search;
