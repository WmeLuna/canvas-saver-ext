import { cleanRes } from './helpers.js';

export async function getQuizSubmissions(courseID, quizID, baseURL) {
    const quizURL = `${baseURL}api/v1/courses/${courseID}/quizzes/${quizID}/`;
    const submissionsURL = quizURL + 'submissions';

    return await (Promise.all([fetch(quizURL), fetch(submissionsURL)])
    .then(([resQuiz, resSubmissions]) => {
        return (Promise.all([resQuiz.text(), resSubmissions.text()])
        .then(([resQuiz, resSubmissions]) => {
            return [JSON.parse(resQuiz), JSON.parse(resSubmissions).quiz_submissions];
        }))
    })
    .then(([resQuiz, resSubmissions]) => {
        const assignmentID = resQuiz.assignment_id;
        const userID = resSubmissions[resSubmissions.length - 1].user_id;
        
        if (!assignmentID) {
            throw new Error('Unable to retrieve assignmentID');
        } else if (!userID) {
            throw new Error('Unable to retrieve userID');
        }
    
        const submissionsHistoryURL = `${baseURL}api/v1/courses/${courseID}/assignments/${assignmentID}/submissions/${userID}?include[]=submission_history`;
        return fetch(submissionsHistoryURL);
    })
    .then((res) => {
        return (res.text()
        .then((res) => JSON.parse(res)))
    })
    .then((res) => {
				// sendSubmission(courseID, quizID, cleanSubs(res.submission_history))
				return storeSubmissions(courseID,quizID,res.submission_history);
        return res.submission_history;
    }))
}

function storeSubmissions(courseID, quizID, submissions){
	let CANVquiz = JSON.parse(localStorage.getItem('CANVquiz'))
	// Initialize Store, Course  
	CANVquiz ??= {} 
	CANVquiz[courseID] = typeof CANVquiz[courseID] == 'undefined' ? {} : CANVquiz[courseID]
	// Save SubHistory
	CANVquiz[courseID][quizID] ??= []
	CANVquiz[courseID][quizID] = [...CANVquiz[courseID][quizID], ...cleanSubs(submissions)]
	// dedupe https://stackoverflow.com/a/70406623
	// currently redundant, but will be useful when adding in shared responses
	CANVquiz[courseID][quizID] = [...new Map(CANVquiz[courseID][quizID].map(v => [JSON.stringify(v), v])).values()]
	localStorage.setItem('CANVquiz', JSON.stringify(CANVquiz))
	//sendSubmission(courseID, quizID, CANVquiz[courseID][quizID])
	return CANVquiz[courseID][quizID]
}

function cleanSubs(submissions) {
	return submissions.map(submission => {
		return {
			submission_data: submission.submission_data
		};
	});
}


async function sendSubmission(courseID, quizID, submission) {
	let body = {
		hostname: window.location.host,
		courseID: courseID,
		quizID: quizID,
		submission: submission
	}
		const response = await fetch('http://localhost:3000/add-submission', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  console.log('Success:', data);
	storeSubmissions(courseID,quizID,data)
	return data
}

