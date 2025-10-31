// src/services/spotifyService.ts
import api from "./api";

export const spotifyService = {
  async getProfile() {
    const res = await api.get("/spotify/me");
    return res.data;
  },
  async getTopArtists() {
    const res = await api.get("/spotify/top-artists");
    return res.data;
  },
};
