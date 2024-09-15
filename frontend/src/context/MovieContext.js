import React, {createContext, useState} from "react";

export const MovieContext=createContext();

export const MovieProvider = ({ children }) => {
    const [addedMovies, setAddedMovies] = useState(new Set());
  
    const addMovie = (id) => {
      setAddedMovies((prev) => new Set(prev).add(id));
    };
  
    const removeMovie = (id) => {
      setAddedMovies((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    };
  
    return (
      <MovieContext.Provider value={{ addedMovies, addMovie, removeMovie }}>
        {children}
      </MovieContext.Provider>
    );
};