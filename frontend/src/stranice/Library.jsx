import React, { useContext, useEffect, useState } from 'react';
import styles from "./Library.module.css";
import Navbar from "../komponente/Navbar";
import { AuthContext } from '../context/authContext';
import { MovieContext } from '../context/MovieContext';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { AudioPlayerContext } from '../context/audioContext';

const Kartica = ({ id, naziv, ocjena, trajanje, artist, url, naziv_zanra, onPlayMovie, onMovieDelete, onRatingChange }) => {
  const { currentUser } = useContext(AuthContext);
  const {removeMovie}=useContext(MovieContext);
  const [editing, isEditing]=useState(false);
  const [newRating, setNewRating]=useState(ocjena);

  const handlePlayMovie = () => {
    onPlayMovie(url);
  };
  
  const unlikeMovie=async()=>{
    try{
      const res=await axios.delete(`/library/${currentUser.username}/${id}`);
      alert("Pjesma obrisana!");
      if (onMovieDelete) {
        onMovieDelete(id);
      }
      removeMovie(id);
    } catch(err){
      alert("Greska pri brisanju!");
      console.error("Greska pri brisanju!", err);
    }
  }
  
  const handleRatingClick=()=>{
    isEditing(true);
  };

  const handleRatingSubmit=async(e)=>{
    e.preventDefault();
    try{
      const res=await axios.put(`library/${currentUser.username}/${id}`,{ocjena:newRating});
      onRatingChange(id, newRating);
      isEditing(false);
    } catch(err){
      alert("Greska pri azuriranju ocjene!");
      console.error(err);
    }
  }

  return (
    <div className={styles.MovieItem}>
      <h4 className={styles.MovieName} onClick={handlePlayMovie}>{naziv}</h4>
      <h5 className={styles.MovieArtist}>{artist}</h5>
      <h5 className={styles.MovieRate} title='Izmijeni ocjenu' onClick={()=>isEditing(!editing)}>{ocjena?ocjena:"dodaj"}</h5>
     {editing && (
      <form action="" onSubmit={handleRatingSubmit}>
        <input type="number" step={0.1} value={newRating} onChange={(e)=>setNewRating(e.target.value)} />
        <button type="submit">Update</button>  
      </form>
     )}
      <h5 className={styles.MovieDuration}>{trajanje}</h5>
      <h5>{naziv_zanra}</h5>
      <button className={styles.delete} onClick={unlikeMovie}>Unlike</button>
    </div>
  );
};

const Library = () => {
  const { removeMovie } = useContext(MovieContext);
  const { playMovie } = useContext(AudioPlayerContext);
  const [library, setLibrary] = useState([]);
  const [likedcnt, setLikedCnt] = useState();
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const [filter, setFilter] = useState({ search: '', filter: '', sort: '' });
  const [slika, setSlika] = useState();
  const [edit, setEdit]=useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate('/login');
    }

    const loadMovies = async () => {
      try {
        const res = await axios.get(`/library/${currentUser.username}`, { params: filter });
        setLibrary(res.data);
        console.log(res.data);
      } catch (err) {
        console.error("Error fetching movies!", err);
      }
    };

    const loadLikedCount = async () => {
      try {
        const res = await axios.get(`/library/${currentUser.username}/count`);
        setLikedCnt(res.data.LikedCnt);
      } catch (err) {
        console.error("Greska pri countu", err);
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

  const handlePlayMovie = (url) => {
    playMovie(url);
  };

  const handleFile = (e) => {
    setSlika(e.target.files[0]);
  };

  const handleChangeImage = async (e) => {
    const formdata = new FormData();
    formdata.append('slika', slika);
    try{
     await axios.post("/image/", formdata);
     await axios.put("/users/pfp/", {
      slika:`http://localhost:8800/public/slike/${slika.name}`,
     });
     setCurrentUser({
      ...currentUser,
        slika: `http://localhost:8800/public/slike/${slika.name}`,
      });
      localStorage.setItem("user", JSON.stringify(currentUser));
      setEdit(false)
    } catch (err) {
      console.error(err);
    }
  }

  const handleRatingUpdate = (id, newRating) => {
    setLibrary(prevLibrary =>
      prevLibrary.map(movie =>
        movie.ID === id ? { ...movie, ocjena: newRating } : movie
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
            {edit?(<>
            <label htmlFor="slika">Change pfp</label>
            <input type="file" name="slika" id="slika" onChange={handleFile} className={styles.editpfp} />
            <button onClick={handleChangeImage}>promijeni</button>
            <button onClick={()=>setEdit(false)}>cancel</button>
            </>):<button className={styles.editbtn} onClick={()=>setEdit(true)}>Edit pfp</button>}
          </div>
        </div>
        <div className={styles.FilterContainer}>
          <input
            type="text"
            name="search"
            placeholder="Filter by genre, artist, title"
            value={filter.search}
            onChange={handleFilterChange}
          />
          <select name="filter" value={filter.filter} onChange={handleFilterChange}>
            <option value="-">-</option>
            <option value="Title">Title</option>
            <option value="Artist">Artist</option>
            <option value="Duration">Duration</option>
            <option value="Rating">Rating</option>
            <option value="Genre">Genre</option>
          </select>
          <div className={styles.OrderRadioButtons}>
            <label htmlFor='sort' style={{"fontFamily":"sans-serif"}}>Λ
              </label>
              <input
                type="radio"
                name="sort"
                value="asc"
                checked={filter.sort === 'asc'}
                onChange={handleFilterChange}
              />
            <label htmlFor='sort'>V
            </label>
              <input
                type="radio"
                name="sort"
                value="desc"
                checked={filter.sort === 'desc'}
                onChange={handleFilterChange}
              />
              
          </div>
        </div>
        </div>
        <div className={styles.MoviesContainer}>
          <div className={styles.MovieList}>
          {Array.isArray(library) && library.length > 0 ? (
          library.map(movie => (
            <Kartica
              key={movie.ID}
              id={movie.ID}
              naziv={movie.naziv}
              ocjena={movie.ocjena}
              artist={movie.artist}
              trajanje={movie.trajanje}
              naziv_zanra={movie.naziv_zanra}
              url={movie.url}
              onPlayMovie={handlePlayMovie}
              onMovieDelete={handleMovieDelete}
              onRatingChange={handleRatingUpdate}
            />
          ))
        ) : (
          <p>No movies available.</p>
        )}
          </div>
        </div>
      </div>

  );
};

export default Library;