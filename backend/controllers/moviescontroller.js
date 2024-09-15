import {db} from "../server.js";

export const getMovies=(req, res) => {
    // const q = `select film.ID, i.ime_izvodjac, film.naziv, film.url, film.trajanje, film.ocjena , z.naziv as zanr_naziv from film
    // inner join film_izvodjac i on i.id_film=film.ID
    // inner join zanr z on z.naziv=film.naziv_zanra
    // `;
    const q=`select * from film`;
    db.query(q, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
};

export const addMovie=(req, res)=>{    
    const { naziv, trailer_url, naziv_zanra, reziser, godina, description } = req.body;
    const q = "INSERT INTO film (naziv, trailer_url, naziv_zanra, reziser, godina, description) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(q, [naziv, trailer_url, naziv_zanra, reziser, godina, description], (err, data) => {
        if (err) return res.json(err);
        return res.json("film dodata!");
    });
};

export const getByMovieID=(req, res)=>{
    const { id } = req.params;
    const q = "SELECT * FROM film WHERE ID=?";
    db.query(q, [id], (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
};

export const updateByID=(req, res) => {
    const { id } = req.params;
    const { naziv, trailer_url, naziv_zanra, reziser, godina, description } = req.body;
    const q = "UPDATE film SET naziv = ?, trailer_url = ?, naziv_zanra = ?, reziser = ?, godina = ?, description = ?, WHERE ID = ?";
    db.query(q, [naziv, trailer_url, naziv_zanra, reziser, godina, description, id], (err, data) => {
        if (err) return res.json(err);
        return res.json("film azurirana!");
    });
};

export const deleteByID=(req, res) => {
    const { id } = req.params;
    const q = "DELETE from film where ID=?";
    db.query(q, [id], (err, data) => {
        if (err) return res.json(err);
        return res.json("film obrisana!");
    });
};