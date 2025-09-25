import db from '../libs/db.js'
import { poolBatchResults } from '../libs/judge0.libs.js';

export const  createProblem = async(req, res) =>{
    const { title, description, difficulty, tags, example, constraints, testcases, codeSnippets, refrenceSolution } = req.body;

    if(req.user !== "ADMIN"){
        return res.status(403).json({
            error:"You are not allowed to create a problem"
        })
    }

    try {
        for(const [language, solutionCode] of object.entries(refrenceSolution))
        {
            const languageId = getJudge0Id(language)

            if(!languageId){
                return res.status(400).json({
                    error: `Language ${language} is not supported`
                })
            }

            const submissions = testcases.map(({input, output})=>({
                source_code : solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output,
            }))

            const submissionResults = await submitBatch(submissions)

            const tokens = submissionResults.map((res)=> res.token)

            const results = await poolBatchResults(tokens)

            for(let i = 0; i< results.length; i++){
                const result = results[i]

                if(result.status.id !== 3){
                    return res.status(400).json({
                        error: `Testcase ${i+1} failed for language ${language}`
                    })
                }
            }
                const newProblem = await db.problem.create({
                data:{
                        title, description, difficulty, tags, example, constraints, testcases, codeSnippets, refrenceSolution,
                        userId: req.user.id,
}
                })

                return res.status(201).json({
                    message: "Problem create successfully",
                    problem: newProblem
                })
           
        }
    } catch (error) {
console.log("Error", error)
return res.status(401).json({
    error: "Proble can't added"
})
    }
}

export const getAllProblems = async(req, res) =>{
    try {
        const problem = await db.problem.findMany();

        if(!problem){
            return res.status(404).json({
                error: "No problem Found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Featch Successfully ✅",
            problem
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: "Error while featching Problem",
        })
    }
}

export const getProblemById = async(req, res)=>{
    
}

export const updateProblem = async(req, res)=>{}

export const deleteProblem = async(req, res)=>{}

export const getAllProblemsSolvedByUser = async (req, res)=>{}