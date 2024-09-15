import express from "express";
import { LikeCount, getLikedByUser, getRateOfMovie, likeMovie, removeLike, updateRateOfMovie, getRestOfMovies } from "../controllers/librarycontroller.js";

const router=express.Router();

//uzmi pjesme korisnika koje se nalaze u library-ju, tj koje je on lajkovao
router.get("/:username", getLikedByUser);

router.get("/:username/exc", getRestOfMovies);

//lajkuj pjesmu, tj za datog korisnika za neku pjesmu ubaci u pjesma_korisnik(library)
router.post("/:username/:movie_id", likeMovie);

//vrati broj lajkovanih pjesama za korisnika
router.get("/:username/count", LikeCount);

//azuriraj ocjenu pjesme za korisnika u library-ju
router.put("/:username/:movie_id", updateRateOfMovie);

//dislajkuj pjesmu za korisnika, brise se objekat tabele pjesma_korisnik
router.delete("/:username/:movie_id", removeLike);

//prikazi ocjenu za datu pjesmu od datog korisnika!!!
router.get("/:username/:movie_id/ocjena", getRateOfMovie);

export default router;