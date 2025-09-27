import { db } from "../libs/db";

export const createPlayList = async (req, res)=>{
    try {
        const {name, description} = req.body;
        userId = req.user.id

        const playlist = await db.playlist.create({
            data:{
                name,
                description,
                userId
            }
        })

        res.status(200).json({
            data: playlist
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: "Somthing went wrong"
        })
    }
}

export const getAllListDetails = async (req, res)=>{
    try {
        
        const playlists = await db.playlist.findMany({
            where:{
                userId: req.user.id
            },
            include:{
                problems:{
                    include:{
                        problem: true
                    }
                }
            }
        })

        res.status(200).json({
            data: playlists
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error:"Something went wrong"
        })
    }
}

export const getPlayListDetails = async (req, res)=>{
    try {
        const {playlistId} = req.params

        const playlist = await db.playlist.findUnique({
            where:{
                userId: req.user.id,
                id: [playlistId]
            },
            include:{
                problems:{
                    include:{
                        problem: true
                    }
                }
            }
        })

        if(!playlist){
            return res.status(404).json({message:"Playlist not found"})
        }

        res.status(200).json({
            data: playlist
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            erroe: "Somthing went wrong"
        })
    }
}

export const addProblemToPlayList = async (req, res)=>{
    try {
        
        const {playlistId} = req.params;
        const {problemIds} = req.body;

        if(!Array.isArray(problemIds)|| problemIds.length === 0){
            return res.status(400).json({error: "Invalid and missing problemsid"})
        }

         const problemInPlaylist = await db.problemsInPlaylist.createMany({
            data:problemIds.map((problemId)=>({
                playlistId,
                problemId
            }))
         })

         res.status(201).json({
            message:"Problems addded to playlist Successfully",
            problemInPlaylist
         })
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "somthing went wrong"})
    }
}

export const deletePlaylist = async (req, res)=>{
    try {
        const {playlistId} = req.params;
        const deletedPlaylist = db.playlist.delete({
            where:{
                id:playlistId
            }
        })

        res.status(200).json({
            message: "Sab Delete ho gaya hai",
            data: deletePlaylist
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "somthing went wrong" })
    }
}

export const removeProblemFromPlaylist = async (req, res)=>{
    try {
        const {playlistId} = req.params;
        const {problemIds} = req.body;

        if (!Array.isArray(problemIds) || problemIds.length === 0) {
            return res.status(400).json({ error: "Invalid and missing problemsid" })
        }

const deleteProblem = await db.problemsInPlaylist.deleteMany({
    where:{
        playlistId,
        problemId:{
            in:{
                problemIds
            }
        }
    }
})

res.status(200).json({
    data: deleteProblem,
    message: "Playlist ProblemsIds deleted"
})

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "somthing went wrong" })
    }
}