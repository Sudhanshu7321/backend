import { poolBatchResults, submitBatch } from "../libs/judge0.libs.js";

 export const executeCode = async (req, res)=>{
    
   try {
        const { source_code, language_id, stdin, expected_outputs, problemId } = req.body;

        const userId = req.user.id;

       // validate test cases
       if (!Array.isArray(stdin) || stdin.length === 0 || !Array.isArray(expected_outputs) || expected_outputs.length !== stdin.length) {
           return res.status(400).json({
               error: "Invalid or  Missing test Case"
           })
       }

       // Prepare each test cases for judge0 batch submission

       const submissions = stdin.map((input) => ({
           source_code,
           language_id,
           stdin: input,

}))

       // 3. Send batch of submission to judge0
       const submitResponse = await submitBatch(submissions)
       const tokens = submitResponse.map((res) => res.token)

       // 4. Poll judge0 for results of all submitted test cases

       const result = await poolBatchResults(tokens)

       console.log("result _____________")
       console.log(result)

       return res.status(200).json({
           message: "Code executed"
       })
    } catch (error) {
        
    }
 }