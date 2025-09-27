export const getAllSubmission = async(req, res)=>{
    try {
        const userId = req.user.id;

        const submission = await db.submission.findMany({
            where:{
                userId: userId
            }
        })

        res.status(200).json({
            success: true,
            message: "Submission featched Successfully",
            submission
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: "Somthing went Wrong"
        })
    }
}

export const getSubmissionsForProblem = async (req,res)=>{
    try {
        const userId = req.user.id;
        const problemId = req.params.problemId
        const submissions = await db.submission.findMany({
            where:{
                userId: userId,
                problemId: problemId
            }
        })

        res.status(200).json({
            success: true,
            message:"Submission featch successfully",
            data: submissions

        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: "Somthing went Wrong"
        }) 
    }
}

export const getAllTheSubmissionsForProblem = async (req,res)=>{

    try {
        const problemId = req.params.problemId
        const submission = await db.submission.count({
            where:{
                problemId: problemId
            }
        })

        res.status(200).json({
            success: true,
            message: "Submission count Successfully",
            data: submission
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: "Somthing went Wrong"
        })
    }
}