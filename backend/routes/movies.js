import express from "express";
import { addMovie, deleteByID, getByMovieID, getMovies, updateByID } from "../controllers/moviescontroller.js";
const router=express.Router();

//izlistaj sve pjesme koje korisnik nije lajkovao
router.get("/", getMovies);

//kreiraj pjesmu
router.post("/", addMovie);

//uzmi pjesmu po njenom ID-ju
router.get("/:id", getByMovieID);

//azuriraj podatke pjesme koja se vadi po ID-ju pjesme!!!
router.put("/:id", updateByID);

//brisanje pjesme po ID-ju!!!
router.delete("/:id", deleteByID);

export default router;