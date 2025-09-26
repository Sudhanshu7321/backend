import { poolBatchResults, submitBatch } from "../libs/judge0.libs.js";
import { db } from "../libs/db.js"

export const executeCode = async (req, res) => {

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

        // Analyze test case results
        let allPassed = true
        const detailedResults = result.map((result, i) => {
            const stdout = result.stdout?.trim()
            const expected_output = expected_outputs[i]?.trim()
            const passed = stdout === expected_output

            if (!passed) allPassed = false

            return {
                testCase: i + 1,
                passed,
                stdout,
                expected: expected_output,
                stderr: result.stderr || null,
                compile_output: result.compile_output || null,
                status: result.status.description,
                memory: result.memory ? `${result.memory} KB` : undefined,
                time: result.time ? `${result.time} S` : undefined
            }


        })

        // store submiossion summary 
        const submission = await db.submission.create({
            data: {
                userId,
                problemId,
                sourceCode: source_code,
                language: getLanguageName(language_id),
                stdin: stdin.join("\n"),
                stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
                stderr: detailedResults.some((r) => r.stderr) ? JSON.stringify(detailedResults.map((r) => r.stderr)) : null,
                compileOutput: detailedResults.some((r) => r.compileOutput) ? JSON.stringify(detailedResults.map((r) => r.compileOutput)) : null,
                status: allPassed ? "Accepted" : "Wrong Answer",
                memory: detailedResults.some((r) => r.memory) ? JSON.stringify(detailedResults.map((r) => r.memory)) : null,
                time: detailedResults.some((r) => r.time) ? JSON.stringify(detailedResults.map((r) => r.time)) : null,
            }
        })

        // if all case pass mark done for current user
        if (allPassed) {
            await db.problemSolved.upsert({
                where: {
                    userId_problemId: {
                        userId, problemId
                    }
                },
                update: {},
                create: {
                    userId, problemId
                }
            })
        }

        // save individual test case results using detailedResult

        const testCaseResults = detailedResults.map((result) => ({
            submissionId: submission.id,
            testCase: result.testCase,
            passed: result.passed,
            stdout: result.stdout,
            expected: result.expected,
            stderr: result.stderr,
            compileOutput: result.compile_output,
            status: result.status,
            memory: result.memory,
            time: result.time
        }))

        await db.testCaseResults.creatMany({
            data: testCaseResults

        })

        const submissionWithTestCase = await db.submission.findUnique({
            where: {
                id: submission.id
            },
            include: {
                testCase: true
            }
        })

        return res.status(200).json({
            submission: submissionWithTestCase,
            message: "Code executed"
        })
    } catch (error) {
        console.log("error", error)
        res.status(500).json({
            error: "Code execution Fail"
        })
    }
}