import express from 'express'
import {authMiddleware} from './../middleware/auth.middleware.js'
import { addProblemToPlayList, createPlayList, deletePlaylist, getAllListDetails, getPlayListDetails, removeProblemFromPlaylist } from '../controllers/playlist.controller.js'
const playlistRoutes = express.Router()

playlistRoutes.get("/", authMiddleware, getAllListDetails)

playlistRoutes.get("/:playlistId",  authMiddleware,getPlayListDetails)

playlistRoutes.post("/create-playlist", authMiddleware, createPlayList)

playlistRoutes.post("/:playlistId/add-problem", authMiddleware, addProblemToPlayList)

playlistRoutes.delete("/:playlistId", authMiddleware, deletePlaylist)

playlistRoutes.delete("/:playlistId/remove-problem", authMiddleware, removeProblemFromPlaylist)



export default playlistRoutes